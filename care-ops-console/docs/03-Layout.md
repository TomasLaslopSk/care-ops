# `src/components/Layout.tsx` — app shell (rám aplikácie)

## Čo to je
Stály rám okolo každej stránky: vľavo **sidebar** (logo + navigácia), hore **topbar**,
v strede **obsah** (aktuálna stránka). Renderuje sa raz (z root route) a nemení sa pri
prechode medzi stránkami — mení sa len obsah.

## Celý kód
```tsx
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

const nav = [
  { to: "/", label: "Dashboard" },
  { to: "/visits", label: "Visits" },
  { to: "/carers", label: "Carers" },
] as const;

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-surface flex flex-col">
        <div className="px-4 h-14 flex items-center font-bold text-lg border-b border-border">
          Care<span className="text-secondary">Ops</span>
        </div>
        <nav className="p-2 flex flex-col gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-3 py-2 rounded-lg text-sm text-muted hover:bg-surface-2 hover:text-text transition-colors [&.active]:bg-primary [&.active]:text-white"
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-3 text-xs text-muted border-t border-border">v0.1 · operator console</div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 shrink-0 border-b border-border bg-surface flex items-center justify-between px-4">
          <div className="text-sm text-muted">Cera — Care Operations</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex h-2 w-2 rounded-full bg-success" /> Live
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
```

## Krok po kroku

**1. Importy (riadky 1–2)**
- `import type { ReactNode }` — typ pre "čokoľvek, čo sa dá vykresliť" (text, JSX, ...).
  Slovíčko `type` znamená import LEN typu (zmizne pri builde, nezaťaží bundle).
- `Link` z TanStack Routera — ako `<a>`, ale interné (nereloaduje stránku) a type-safe.

**2. Navigačné dáta (riadky 4–8)**
```tsx
const nav = [ { to: "/", label: "Dashboard" }, ... ] as const;
```
Pole odkazov ako dáta, nie ako napísané HTML. Vykreslíme ich cyklom (DRY — keď
pribudne stránka, pridáš jeden riadok). `as const` = TS to zmrazí (presné stringy,
nie všeobecný `string`), čo pomáha type-safety pri `to`.

**3. Signatúra komponentu (riadok 10)**
```tsx
export default function Layout({ children }: { children: ReactNode }) {
```
Komponent prijíma `children` (obsah, ktorý doň vložíš). Sem router posiela `<Outlet/>`.
Typ je `ReactNode`.

**4. Najvrchnejší kontajner (riadok 12)**
```tsx
<div className="flex h-screen">
```
`flex` = deti vedľa seba (2 stĺpce), `h-screen` = výška celej obrazovky.

**5. Sidebar (riadky 14–31)**
- `<aside className="w-56 shrink-0 ... flex flex-col">` — pevná šírka 224px,
  `shrink-0` = nikdy sa nezmenší, `flex flex-col` = vnútri všetko pod seba.
- Logo: `Care<span className="text-secondary">Ops</span>` — slovo "Ops" má farbu
  z tokenu `--color-secondary` (token-driven, viď `docs` o CSS).
- Navigácia: `nav.map(...)` vykreslí `<Link>` pre každú položku.
  - `key={n.to}` — React potrebuje unikátny `key` v zoznamoch (na efektívne
    prekresľovanie).
  - `[&.active]:bg-primary [&.active]:text-white` — Tailwind trik: keď TanStack
    pridá Linku triedu `active` (lebo sedí na aktuálnu URL), zafarbí sa.
    `[&.active]:` znamená "aplikuj, keď tento element má triedu `active`".
  - `activeOptions={{ exact: n.to === "/" }}` — pri `/` chceme presnú zhodu
    (inak by Dashboard svietil ako aktívny aj na `/visits`, lebo všetko začína `/`).
- `<div className="mt-auto ...">` — `mt-auto` ho odtlačí úplne dole (margin-top
  zožerie voľné miesto). Tu je verzia.

**6. Pravá časť (riadky 34–42)**
- `<div className="flex-1 flex flex-col min-w-0">` — `flex-1` = zaber zvyšok šírky,
  `flex-col` = topbar a obsah pod seba, `min-w-0` = dôležitý fix, aby široký obsah
  (napr. tabuľka) neroztiahol layout a namiesto toho scrolloval.
- Topbar `<header>` — pevná výška, `justify-between` rozhodí ľavý nadpis a pravý
  "Live" indikátor do strán. Zelená bodka = `bg-success` (token).
- `<main className="flex-1 overflow-auto p-6">{children}</main>` — vyplní zvyšok
  výšky, `overflow-auto` = scrolluje LEN obsah (sidebar/topbar ostávajú), `p-6` padding.
  `{children}` = sem sa vloží aktuálna stránka.

## Vizuálne
```
┌────────┬──────────────────────┐
│ CareOps│ Cera — Care Ops · Live│ ← topbar (h-14)
│ ────── ├──────────────────────┤
│ Dash   │                      │
│ Visits │   {children}         │ ← stránka, scrolluje
│ Carers │                      │
│ v0.1   │                      │
└────────┴──────────────────────┘
  w-56        flex-1
```

## Pojmy
- **`children`** = obsah vložený medzi otváraciu a zatváraciu značku komponentu.
- **`.map()` render** = vykreslenie zoznamu z poľa dát; každá položka potrebuje `key`.
- **`flex` / `flex-col` / `flex-1` / `shrink-0`** = flexbox: smer ukladania a pružnosť.
- **`[&.active]:`** = Tailwind "arbitrary variant" — štýl podmienený triedou na elemente.

## Pre pohovor
"Layout je app-shell pattern: renderuje sa raz z root route, pri navigácii sa mení
len `<Outlet/>` obsah, takže sidebar/topbar sa neprekresľujú. Aktívny stav linku
rieši router (trieda `active`) + token-driven Tailwind. Celé rozloženie je flexbox,
žiadny CSS súbor — všetko deklaratívne v JSX cez utility triedy z tokenov."
