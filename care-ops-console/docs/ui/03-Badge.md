# `src/components/ui/Badge.tsx` — stavový "pill" štítok

## Čo to je
Malý oválny štítok na stav (napr. "On time", "Delayed", "Missed"). Má tóny
(`neutral`, `success`, `warning`, `danger`, `info`), ktoré mapujú na sémantické tokeny.

## Celý kód
```tsx
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  info: "bg-primary/15 text-primary",
};

export default function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
```

## Krok po kroku
- `Tone` je union typ — povolené tóny. `tones` je `Record<Tone, string>`, takže pre
  každý tón MUSÍ existovať definícia (TS to vynúti).
- Trik s priehľadnosťou: `bg-success/15` znamená "farba success, ale len **15 %**
  krytia" — teda jemné podfarbené pozadie. Text `text-success` je plná farba.
  Vznikne tak čitateľný farebný štítok bez kričania. Číslo za lomítkom je opacity (0–100).
- `rounded-full` = úplne oválne konce (pill). `text-xs`, `px-2 py-0.5` = malé rozmery.
- Default `tone="neutral"`. Zvyšok props (`...props`) ide na `<span>`.

## Pojmy
- **Token + opacity** (`bg-success/15`) = sémantická farba s priesvitnosťou; netreba
  zvlášť definovať "svetlú verziu" farby.
- **Tone-based API** = komponent neberie konkrétnu farbu, ale *význam* (success/danger).
  Význam → farba je vec design systému, nie volajúceho.

## Pre pohovor
"Badge má tone-based API — odovzdávaš význam (success/warning/danger), nie farbu.
Tóny mapujú na tokeny s opacity (`bg-danger/15` + `text-danger`), takže rebrand =
zmena tokenu, nie hľadanie po komponentoch."
