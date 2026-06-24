# `src/components/ui/Stat.tsx` — KPI dlaždica

## Čo to je
Jedna "číselná" karta: popisok hore, veľká hodnota, nepovinný drobný hint dole.
Postavená **na `Card`** — ukážka, ako sa z malých primitívov skladajú väčšie.

## Celý kód
```tsx
import type { ReactNode } from "react";
import Card from "./Card";

interface StatProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
}

export default function Stat({ label, value, hint }: StatProps) {
  return (
    <Card>
      <div className="text-muted text-xs uppercase tracking-wide">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
      {hint && <div className="text-muted text-xs mt-1">{hint}</div>}
    </Card>
  );
}
```

## Krok po kroku
- **Props (riadky 4–8):**
  - `label: string` — povinný text popisku.
  - `value: ReactNode` — hodnota; typ `ReactNode` znamená "čokoľvek vykresliteľné"
    (text, číslo, aj JSX ako `<Badge>`). Flexibilné.
  - `hint?: ReactNode` — nepovinný (otáznik) doplnkový riadok.
- **Kompozícia:** vnútri vraciame `<Card>` — Stat si nerieši pozadie/okraj/padding,
  zdedí to z Card. Keď sa zmení Card, zmenia sa aj všetky Staty. To je **kompozícia**,
  nie kopírovanie.
- **Podmienené vykreslenie (`{hint && ...}`):** ak je `hint` zadaný, vykreslí sa riadok;
  ak nie (`undefined` → falsy), nevykreslí sa nič. Bežný React vzor pre "voliteľnú časť".
- Štýly: `uppercase tracking-wide` (rozpálkované veľké písmená popisku), `text-3xl
  font-bold` (veľká hodnota) — všetko Tailwind utility + tokeny.

## Pojmy
- **Kompozícia komponentov** = väčší komponent (Stat) postavený z menšieho (Card).
- **`ReactNode`** = typ pre čokoľvek, čo React vie vykresliť.
- **Conditional rendering** (`cond && <jsx/>`) = vykresli časť len ak podmienka platí.

## Použitie
```tsx
<Stat label="Today's visits" value="128" hint="+12 vs yesterday" />
<Stat label="Open alerts" value={<Badge tone="danger">3</Badge>} />
```

## Pre pohovor
"Stat je príklad kompozície — postavený na Card, takže dedí povrch. `value` je
`ReactNode`, takže doň viem dať aj Badge. To je ten layered design system: tokeny →
primitívy (Card/Badge) → zložené komponenty (Stat) → stránky."
