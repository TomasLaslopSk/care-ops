# `src/lib/cn.ts` — pomocník na spájanie tried

## Čo to je
Malá funkcia, ktorá spojí viacero CSS tried do jedného stringu a **vyhodí prázdne**
(`false`, `null`, `undefined`). Vďaka nej vieme v komponentoch podmienečne pridávať triedy.

## Celý kód
```ts
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
```

## Krok po kroku
- `...parts` — **rest parameter**: funkcia berie ľubovoľný počet argumentov a urobí
  z nich pole. Takže `cn("a", "b", "c")` → `parts = ["a","b","c"]`.
- Typ `Array<string | false | null | undefined>` — povolíme aj `false`/`null`, lebo
  chceme písať `condition && "trieda"` (keď je `condition` false, vznikne `false`).
- `.filter(Boolean)` — vyhodí všetky "falsy" hodnoty (prázdne, false, null...).
  `Boolean` je tu funkcia, ktorá z hodnoty spraví true/false.
- `.join(" ")` — pospája zvyšok medzerou do jedného stringu.

## Príklad použitia
```tsx
cn("px-3", isActive && "bg-primary", size === "sm" && "h-8", props.className)
// isActive=false, size="md" → "px-3"
// isActive=true,  size="sm" → "px-3 bg-primary h-8"
```

## Prečo to potrebujeme
Bez `cn` by sa podmienené triedy lepili cez škaredé string template-y a ľahko by
vznikli dvojité medzery alebo `undefined` v class atribúte. `cn` to čistí.
(V profi projektoch sa často používa knižnica `clsx` + `tailwind-merge`; my máme
zámerne minimalistickú vlastnú verziu — menej závislostí, jasne vidno čo robí.)

## Pre pohovor
"Mám drobný `cn()` helper na conditional classes — vedome bez `clsx`, lebo na tejto
škále stačí pár riadkov a nechcem ťahať závislosť."
