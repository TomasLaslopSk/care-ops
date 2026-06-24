# `src/theme/ceraTheme.ts` — MUI theme (zdroj pravdy pre vzhľad)

## Čo to je
MUI theme objekt — jedno miesto pre farby, tvar (zaoblenie), typografiu. MUI komponenty
si z neho berú vzhľad. Obdoba Tailwind `@theme` tokenov, ale v JS namiesto CSS.

## Celý kód
```ts
import { createTheme } from "@mui/material/styles";

export const ceraTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#0b0f17", paper: "#121a28" },
    primary: { main: "#4f8cff" },
    secondary: { main: "#8b5cf6" },
    success: { main: "#2ec27e" },
    warning: { main: "#f5a524" },
    error: { main: "#f4496d" },
    text: { primary: "#e7eef9", secondary: "#8aa0bd" },
    divider: "#243044",
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none", border: "1px solid #243044" } },
    },
  },
});
```

## Krok po kroku
- `createTheme({...})` — vyrobí MUI theme. To, čo doň dáš, prepíše MUI defaulty.
- **`palette`** — sémantické farby (`primary`, `secondary`, `success`, `warning`,
  `error`). Keď komponent napíše `color="primary"` alebo `sx={{ color: "error.main" }}`,
  berie sa odtiaľto. To je presná obdoba `--color-primary` tokenu v Tailwind tracku —
  len tu je to JS objekt. `mode: "dark"` prepne MUI do tmavého režimu.
- **`shape.borderRadius: 14`** — globálne zaoblenie (obdoba `--radius-lg`).
- **`typography`** — font + úpravy. `button.textTransform: "none"` vypne defaultné
  VEĽKÉ písmená na tlačidlách.
- **`components.MuiPaper.styleOverrides`** — prepíš default vzhľad konkrétneho
  komponentu (tu: Paper bez gradientu, s okrajom). Toto je MUI spôsob "komponentových
  defaultov" — v `micro-fes` to robí `createComponentsOptions.ts` v `dcp-ui`.

## Ako to komponent použije
```tsx
<Button color="primary">      // farba z palette.primary
<Box sx={{ color: "text.secondary", bgcolor: "background.paper" }}>
<Chip color="success" />
```
Žiadne hexy v komponentoch — len mená z theme. Rebrand = zmena tu.

## Tailwind vs MUI (rovnaká myšlienka, iná forma)
| | Tailwind track | MUI track |
|---|---|---|
| Kde žije | `index.css` `@theme` | `ceraTheme.ts` `createTheme` |
| Formát | CSS premenné `--color-*` | JS objekt `palette.*` |
| Použitie | trieda `text-primary` | prop `color="primary"` / `sx` |
| Komponent defaults | utility triedy | `components.MuiX.styleOverrides` |

## Pre pohovor
"MUI theme je u nich (dcp-ui `createCeraUiTheme`) zdroj pravdy — paletu/tvar/typografiu
aj komponentové defaulty drží jeden objekt. Je to tá istá token-driven myšlienka ako
Tailwind `@theme`, len v JS. Komponenty referencujú sémantické mená, nie hexy."
