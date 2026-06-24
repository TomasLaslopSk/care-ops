# `src/main.tsx` — vstupný bod aplikácie

## Čo to je
Úplne prvý súbor, ktorý sa spustí v prehliadači. Jeho úloha: zobrať React appku
a "namountovať" (pripojiť) ju do HTML stránky.

## Celý kód
```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
```

## Krok po kroku

**1. Importy (riadky 1–5)**
- `StrictMode` — React komponent, ktorý počas vývoja zapína extra kontroly
  (upozorní na zastarané API, dvojito spustí niektoré funkcie aby odhalil chyby).
  V produkcii nič nerobí. Čisto vývojárska poistka.
- `createRoot` — funkcia z React 18/19, ktorá vytvorí "root" — miesto, kam React
  bude vykresľovať. Toto je nový spôsob (starý `ReactDOM.render` už neexistuje).
- `RouterProvider` — komponent z TanStack Routera, ktorý "rozbehne" routing
  (sleduje URL a zobrazuje správnu stránku).
- `router` — náš nakonfigurovaný router (z `./router.tsx`, viď ďalší doc).
- `import "./index.css"` — natiahne globálne štýly + Tailwind + design tokeny.
  Žiadnu premennú z toho nepoužívame, len chceme, aby sa CSS pridalo do stránky.

**2. Nájdenie miesta v HTML**
```tsx
document.getElementById("root")!
```
V `index.html` je `<div id="root"></div>`. Toto ho nájde — sem sa appka vloží.
Výkričník `!` na konci je **TypeScript non-null assertion**: hovoríš TS-u
"verím, že tento element existuje, nie je `null`". Bez neho by sa TS sťažoval,
lebo `getElementById` teoreticky môže vrátiť `null`.

**3. Vytvorenie rootu a vykreslenie**
```tsx
createRoot(...).render(<StrictMode>...</StrictMode>)
```
- `createRoot(element)` vytvorí React root naviazaný na ten `<div id="root">`.
- `.render(...)` doň vykreslí náš strom komponentov.
- Celá appka je obalená v `<StrictMode>` (vývojárske kontroly) a vnútri je
  `<RouterProvider router={router} />` — od tohto momentu router preberá kontrolu
  nad tým, čo sa zobrazuje, podľa aktuálnej URL.

## Pojmy
- **Mount** = prvé pripojenie React stromu do reálneho DOM.
- **Root** = vstupný uzol, cez ktorý React spravuje časť stránky.
- **Provider** = komponent, ktorý "poskytuje" niečo (tu: router) celému stromu pod ním.
- **`!` (non-null assertion)** = TS sľub, že hodnota nie je null/undefined.

## Pre pohovor
"Appka sa mountuje cez `createRoot` (React 18/19 API), celý strom riadi
`RouterProvider` z TanStack Routera — žiadny `BrowserRouter` z React Routera,
routing je type-safe a definovaný v kóde."
