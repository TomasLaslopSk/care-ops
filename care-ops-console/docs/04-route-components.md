# `src/routes/*.tsx` — stránky (Dashboard, Visits, Carers)

## Čo to je
Tri komponenty, ktoré router vykreslí podľa URL. Zatiaľ sú to **placeholdery** —
zobrazujú nadpis a popis toho, čo tam pribudne v ďalších fázach. Reálne dáta prídu
od Phase 3 (TanStack Query) a Phase 4 (TanStack Virtual).

---

## `Dashboard.tsx` (URL `/`)
```tsx
export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-muted text-sm mb-6">Care operations overview.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Today's visits", value: "—" },
          { label: "Active carers", value: "—" },
          { label: "Open alerts", value: "—" },
        ].map((c) => (
          <div key={c.label} className="rounded-lg bg-surface border border-border p-4">
            <div className="text-muted text-xs uppercase tracking-wide">{c.label}</div>
            <div className="text-3xl font-bold mt-1">{c.value}</div>
          </div>
        ))}
      </div>
      <p className="text-muted text-sm mt-8">Phase 0 ✓ — shell, routing, design tokens. Data comes in later phases.</p>
    </div>
  );
}
```

### Krok po kroku
- `<h1>` + `<p>` — nadpis a podnadpis. Triedy ako `text-2xl`, `font-bold`, `mb-1`
  (margin-bottom) sú Tailwind utility.
- **Stat karty cez grid:**
  ```tsx
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
  ```
  - `grid` = CSS grid layout.
  - `grid-cols-1` = na mobile 1 stĺpec (karty pod sebou).
  - `sm:grid-cols-3` = od šírky "sm" (≥640px) 3 stĺpce vedľa seba. Toto je
    **responzívnosť** — prefix `sm:` aplikuje štýl až od danej veľkosti.
  - `gap-4` = medzera medzi kartami.
- Karty sa vykreslia `.map()`-om z poľa troch objektov. Hodnoty sú `"—"`, lebo
  dáta zatiaľ nemáme. `key={c.label}` — unikátny kľúč pre zoznam.
- Každá karta: `rounded-lg` (zaoblenie z tokenu `--radius-lg`), `bg-surface`,
  `border-border` — všetko z design tokenov.

---

## `Visits.tsx` (URL `/visits`)
```tsx
export default function Visits() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Visits</h1>
      <p className="text-muted text-sm">High-density virtualized visits table goes here (TanStack Virtual + Query).</p>
    </div>
  );
}
```
Placeholder. Sem príde virtualizovaná tabuľka stoviek návštev (Phase 4).

---

## `Carers.tsx` (URL `/carers`)
```tsx
export default function Carers() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Carers</h1>
      <p className="text-muted text-sm">Carer list (TanStack Query + a type-safe API client).</p>
    </div>
  );
}
```
Placeholder. Sem príde zoznam opatrovateľov načítaný cez TanStack Query (Phase 3)
z typovo bezpečného API klienta (Phase 2).

---

## Spoločné pojmy
- **Komponent = funkcia, ktorá vracia JSX.** Názov s veľkým písmenom (`Dashboard`),
  `export default` aby ho router vedel importovať.
- **JSX** = HTML-like syntax v JS. `className` namiesto `class`, `{ }` na vloženie
  JS výrazu (`{c.value}`, `{[...].map(...)}`).
- **Responzívne prefixy** (`sm:`, `md:`, `lg:`) = Tailwind aplikuje štýl od danej
  šírky obrazovky nahor (mobile-first).
- **CSS grid vs flex** — grid pre mriežky (riadky×stĺpce, napr. karty), flex pre
  jednoduché rady/stĺpce (layout).

## Pre pohovor
"Stránky sú obyčajné funkčné komponenty napojené na routy. Dashboard ukazuje
responzívnu grid mriežku stat-kariet (mobile-first: 1 stĺpec → 3 od `sm`), všetko
z design tokenov. Dáta sú zámerne prázdne — pridávajú sa vrstvene v ďalších fázach
(API klient → Query → Virtual), aby bol každý krok izolovaný a otestovateľný."
