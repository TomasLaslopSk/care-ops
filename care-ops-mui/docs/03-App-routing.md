# `src/App.tsx` — routing (react-router-dom 6 + lazy + Suspense)

## Čo to je
Definícia rout cez `react-router-dom` v6 — JSX štýl `<Routes>/<Route>`. Stránky sa
načítavajú lenivo (lazy) za `Suspense` fallbackom. Presne vzor z `micro-fes` App.tsx.

## Celý kód
```tsx
import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

const Carers = lazy(() => import("./pages/Carers"));

export default function App() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <CircularProgress />
        </Box>
      }
    >
      <Routes>
        <Route path="/carers" element={<Carers />} />
        <Route path="*" element={<Navigate to="/carers" replace />} />
      </Routes>
    </Suspense>
  );
}
```

## Krok po kroku
- **`lazy(() => import("./pages/Carers"))`** — Carers sa nezbalí do hlavného bundlu,
  ale do samostatného chunku, ktorý sa stiahne až keď je stránka treba. (Vo výpise
  buildu si videl zvlášť `Carers-*.js` — to je ono.) **Code splitting.**
- **`<Suspense fallback={...}>`** — kým sa lazy chunk načítava, React zobrazí fallback
  (tu MUI spinner `CircularProgress`). `Suspense` je React mechanizmus na "počkaj, kým
  niečo dobehne".
- **`<Routes>` + `<Route path=... element=... />`** — deklaratívne páry URL→komponent.
- **`<Route path="*" element={<Navigate to="/carers" replace />} />`** — catch-all:
  čokoľvek neznáme presmeruj na `/carers`. `replace` = nahradí históriu (nevytvorí
  záznam, na ktorý by sa dalo vrátiť tlačidlom späť).

## react-router-dom 6 vs TanStack Router (druhý track)
| | react-router-dom 6 (tu / micro-fes) | TanStack Router (care-ops-console) |
|---|---|---|
| Definícia rout | JSX `<Routes>/<Route>` | strom objektov v kóde |
| Type-safety ciest | slabšia (path je string) | silná (typované `to`, params) |
| Lazy | `React.lazy` + `Suspense` | vstavané v route configu |

Pre teba dôležité: v Cera budeš písať **react-router-dom 6**, nie TanStack Router.
JD spomína TanStack Router ako smer, kam chcú ísť — ale dnešný kód je v6.

## Pojmy
- **Lazy loading / code splitting** = rozdelenie appky na časti sťahované na požiadanie.
- **`Suspense`** = "počkaj a zatiaľ ukáž fallback".
- **Catch-all route (`path="*"`)** = chytí všetko, čo iné routy nezachytili.

## Pre pohovor
"Routing je react-router-dom v6 s lazy stránkami za Suspense — rovnaký vzor ako
micro-fes App.tsx. Viem, že JD smeruje na TanStack Router (postavil som ho v druhom
projekte), ale produkčný kód je dnes v6, takže s tým viem robiť hneď."
