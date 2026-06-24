# Shell + stránky (Layout, Dashboard, Visits) — zhoda s console

Aby obe učebné appky vyzerali v prehliadači identicky, do mui pribudol rovnaký
**app shell** a stránky ako v `care-ops-console`.

## `src/components/Layout.tsx`
MUI verzia shellu: sidebar (224px) + topbar + obsah, postavené cez `Box` so `sx`.
- Logo `Care` + `Ops` (`Ops` má `color: "secondary.main"`).
- Nav cez `NavLink` z react-router-dom; aktívny link dostane `isActive` →
  `bgcolor: "primary.main"`, inak hover. (V console to rieši trieda `[&.active]`.)
- Topbar: „Cera — Care Operations“ + zelená „Live“ bodka.
Ekvivalent `care-ops-console/src/components/Layout.tsx` —
viď [console doc 03-Layout](../../care-ops-console/docs/03-Layout.md).

## `src/pages/Dashboard.tsx`
Header + 3 stat karty (`Card`/`CardContent`) + „Design system check“ karta s MUI
tlačidlami (`contained`/`outlined`/`text`/`error`) a `Chip`-mi. Zrkadlí console
Dashboard, kde sú to Tailwind `Button`/`Badge`.

## `src/pages/Visits.tsx`
Placeholder, rovnaký text ako console.

## `src/App.tsx`
Teraz obaľuje routy v `<Layout>` a má všetky tri routy (`/`, `/visits`, `/carers`)
lazy-loadnuté za `Suspense`.

## Porovnanie shellu: MUI `sx` vs Tailwind triedy
| | console (Tailwind) | mui (MUI `sx`) |
|---|---|---|
| layout | `className="flex h-screen"` | `sx={{ display:"flex", height:"100vh" }}` |
| aktívny link | `[&.active]:bg-primary` (router trieda) | `isActive ? bgcolor:"primary.main"` |
| farby | tokeny `bg-surface` | theme `bgcolor:"background.paper"` |

## Pre pohovor
"Ten istý app-shell (sidebar/topbar) a stránky som napísal v oboch — raz Tailwind
triedami, raz MUI `sx` z theme. Rovnaká štruktúra a správanie, iná štýlovacia vrstva.
Aktívny stav linku: v MUI cez `NavLink` `isActive`, v Tailwind cez router triedu `active`."
