# `src/components/ui/Card.tsx` — surface kontajner

## Čo to je
Najzákladnejší stavebný blok — zaoblený box s pozadím a okrajom. Skoro každá sekcia
v appke sedí v karte. Prijíma všetky atribúty `<div>`-u.

## Celý kód
```tsx
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export default function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg bg-surface border border-border p-4", className)}
      {...props}
    />
  );
}
```

## Krok po kroku
- `HTMLAttributes<HTMLDivElement>` — typ pre všetky props obyčajného `<div>`-u
  (vrátane `children`, `onClick`, `style`...). Nemusíme nič vymýšľať.
- Vytiahneme `className`, zvyšok `...props` pošleme na `<div>`.
- Default triedy: `rounded-lg` (zaoblenie z `--radius-lg`), `bg-surface` (pozadie
  z tokenu), `border-border`, `p-4` (padding). Všetko token-driven.
- `cn("...", className)` — volajúci môže pridať/upraviť triedy:
  `<Card className="mt-6">` → karta s default vzhľadom + horný margin.

## Prečo taký jednoduchý komponent
Aby bol **jeden zdroj pravdy** pre "ako vyzerá plocha". Keby si chcel zmeniť všetky
karty (napr. väčšie zaoblenie alebo tieň), zmeníš to TU, nie na 30 miestach.
Toto je rozdiel medzi "design systémom" a "kopírovaním tried sem-tam".

## Pre pohovor
"Card je primitív plochy — jeden zdroj pravdy pre povrch. Postavené na ňom sú väčšie
veci (napr. Stat). To je tá kompozícia: malé tokeny → malé primitívy → väčšie celky."
