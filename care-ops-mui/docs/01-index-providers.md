# `src/index.tsx` — entry point + provider stack

## Čo to je
Vstupný bod. Naštartuje MSW (mock API v dev), potom namountuje appku obalenú
stackom providerov — presne v poradí, aké používa `micro-fes`.

## Celý kód
```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ceraTheme } from "./theme/ceraTheme";
import App from "./App";

const queryClient = new QueryClient();

async function bootstrap() {
  if (import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={ceraTheme}>
            <CssBaseline />
            <App />
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </StrictMode>,
  );
}

bootstrap();
```

## Krok po kroku

**1. QueryClient (raz, mimo komponentu)**
```tsx
const queryClient = new QueryClient();
```
Mozog React Query — drží cache všetkých dotazov. Vytvára sa raz pre celú appku.

**2. MSW bootstrap (dev only)**
```tsx
if (import.meta.env.DEV) {
  const { worker } = await import("./mocks/browser");
  await worker.start({ onUnhandledRequest: "bypass" });
}
```
- `import.meta.env.DEV` — true len počas `npm run dev`. V produkcii sa mocky nezapnú.
- `await worker.start(...)` — naštartuje service worker, ktorý zachytáva `/api/*`
  requesty. **`await`** je dôležitý: appku mountujeme až keď je mock pripravený,
  inak by prvý request prešiel popri ňom.
- `onUnhandledRequest: "bypass"` — requesty, na ktoré nemáme handler, nech idú normálne
  (žiadne warningy).

**3. Provider stack — poradie má význam**
```
BrowserRouter → QueryClientProvider → ThemeProvider + CssBaseline → App
```
- `BrowserRouter` (react-router-dom) — sleduje URL. `future={{...}}` zapína v7
  správanie dopredu (`micro-fes` to má tiež — pripravené na React Router 7).
- `QueryClientProvider` — sprístupní query cache cez `useQuery` všade pod ním.
- `ThemeProvider theme={ceraTheme}` — sprístupní MUI theme všetkým MUI komponentom.
- `CssBaseline` — MUI "reset" CSS (normalizuje prehliadačové defaulty, nastaví
  pozadie z theme). Obdoba toho, čo v Tailwind robí preflight.

**Porovnanie s micro-fes:** oni majú navyše `LuxonLocalProvider` (dátumy) a
`AxiosProvider` (axios + auth interceptory) z `@ceracare/*`. My axios držíme
jednoducho v `lib/axios.ts`, lebo nemáme auth.

## Pojmy
- **Provider** = komponent, ktorý cez React Context "dolieva" niečo (router, query
  cache, theme) celému stromu pod sebou. Poradie = vnorenie.
- **`import.meta.env.DEV`** = Vite premenná, true v dev builde.
- **Dynamic import** (`await import(...)`) = načítaj modul až keď treba (tu: MSW len v dev).

## Pre pohovor
"Entry skladá rovnaký provider stack ako micro-fes: Router → Query → Theme → App,
a MSW štartuje pred mountom cez `await`, aby prvý request nepretiekol. V produkcii sa
mocky stromom vôbec nenačítajú (dynamic import za `import.meta.env.DEV`)."
