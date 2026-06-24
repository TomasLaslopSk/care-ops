# `src/router.tsx` — TanStack Router (routovací strom)

## Čo to je
Definícia toho, **aká URL zobrazí ktorý komponent**. Namiesto JSX `<Routes><Route/></Routes>`
(React Router) sa tu routy skladajú ako **strom objektov** v kóde — a to celé type-safe.

## Celý kód
```tsx
import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import Layout from "./components/Layout";
import Dashboard from "./routes/Dashboard";
import Visits from "./routes/Visits";
import Carers from "./routes/Carers";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const dashboardRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: Dashboard });
const visitsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/visits", component: Visits });
const carersRoute = createRoute({ getParentRoute: () => rootRoute, path: "/carers", component: Carers });

const routeTree = rootRoute.addChildren([dashboardRoute, visitsRoute, carersRoute]);

export const router = createRouter({ routeTree });

// Whole-app type safety for the router
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
```

## Krok po kroku

**1. Root route (riadky 7–13)**
```tsx
const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});
```
- `createRootRoute` = koreň celého stromu. Je to "obal", ktorý sa zobrazí **vždy**,
  bez ohľadu na URL.
- Jeho komponent je náš `Layout` (sidebar + topbar). Dôležité: `Layout` sa vykreslí
  raz a pri prechode medzi stránkami sa neprekresľuje.
- `<Outlet />` = "diera", kam router vloží aktuálnu podstránku. Layout dostane obsah
  cez `children`, a `<Outlet/>` práve tieto children produkuje podľa URL.
  Inými slovami: Layout je rám, Outlet je miesto na obrázok.

**2. Detské routy (riadky 15–17)**
```tsx
const dashboardRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: Dashboard });
```
Každá routa hovorí tri veci:
- `getParentRoute: () => rootRoute` — kam patrí (je dieťa root route, takže sa
  zobrazí vnútri Layout/Outlet).
- `path` — pri akej URL sa aktivuje (`/`, `/visits`, `/carers`).
- `component` — čo sa vykreslí.

**3. Zloženie stromu (riadok 19)**
```tsx
const routeTree = rootRoute.addChildren([dashboardRoute, visitsRoute, carersRoute]);
```
Root dostane svoje deti → vznikne kompletný strom: root (Layout) a pod ním 3 stránky.

**4. Vytvorenie routera (riadok 21)**
```tsx
export const router = createRouter({ routeTree });
```
Z hotového stromu sa vyrobí inštancia routera. Exportuje sa, aby ju `main.tsx`
mohol odovzdať do `RouterProvider`.

**5. Type-safety registrácia (riadky 24–28)**
```tsx
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
```
Toto je TypeScript "module augmentation". Hovorí knižnici: "toto je MÔJ konkrétny
router". Vďaka tomu vie TanStack na celý projekt skontrolovať cesty — keď napíšeš
`<Link to="/visits">`, je to overené pri kompilácii. Preklep `<Link to="/vists">`
= chyba pri builde, nie biela stránka v prehliadači.

## Pojmy
- **Route tree** = stromová štruktúra rout (root → deti).
- **`<Outlet />`** = placeholder, kam sa renderuje aktuálna child routa.
- **Code-based routing** = routy definované v kóde objektami (oproti file-based,
  kde routu určuje názov súboru).
- **Module augmentation** (`declare module`) = TS technika na "dopísanie" typov
  do existujúcej knižnice.

## Pre pohovor
"Routing je code-based a type-safe cez TanStack Router. Root route renderuje shell
(`Layout`) s `<Outlet/>`, deti sú jednotlivé stránky. Cez `declare module ... Register`
je router zaregistrovaný do typov, takže všetky `Link`-y a parametre sú kontrolované
kompilátorom — to je presne ten 'type system as a command' bod z JD."
