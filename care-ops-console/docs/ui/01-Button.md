# `src/components/ui/Button.tsx` — tlačidlo s variantmi

## Čo to je
Znovupoužiteľné tlačidlo. Má varianty (`primary`, `secondary`, `ghost`, `danger`)
a veľkosti (`sm`, `md`). Inak sa správa ako obyčajný `<button>` — prijíma všetky
jeho atribúty (`onClick`, `disabled`, `type`...).

## Celý kód
```tsx
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " +
  "disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:opacity-90",
  secondary: "bg-surface-2 text-text hover:bg-border",
  ghost: "bg-transparent text-muted hover:bg-surface-2 hover:text-text",
  danger: "bg-danger text-white hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

export default function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
```

## Krok po kroku

**1. Typy variantov (riadky 4–5)**
```tsx
type Variant = "primary" | "secondary" | "ghost" | "danger";
```
**Union typ** — premenná smie byť LEN jedna z týchto hodnôt. Keď napíšeš
`<Button variant="primry">`, TS to červeno podčiarkne. Toto je sila typov: nedovolené
hodnoty sa nedostanú ani do behu programu.

**2. Props rozhranie (riadky 7–10)**
```tsx
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}
```
- `extends ButtonHTMLAttributes<HTMLButtonElement>` — zdedíme VŠETKY natívne atribúty
  buttonu (`onClick`, `disabled`, `type`, `aria-*`...). Nemusíme ich vypisovať.
- `variant?` a `size?` — otáznik = nepovinné (majú default).

**3. Triedy rozdelené do máp (riadky 12–29)**
- `base` — triedy spoločné pre každé tlačidlo (layout, zaoblenie, focus ring, disabled stav).
  `focus-visible:outline-primary` = pri navigácii klávesnicou sa zobrazí obrys
  (dôležité pre **prístupnosť**).
- `variants` a `sizes` sú objekty typu `Record<Variant, string>` — TS vynúti, že
  pre KAŽDÝ variant/veľkosť existuje záznam. Keď pridáš nový variant do `Variant`,
  TS ťa donúti doplniť aj jeho triedy.
- Farby sú z tokenov (`bg-primary`, `bg-danger`...) — žiadne hexy.

**4. Komponent (riadky 31–40)**
```tsx
export default function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
```
- Default hodnoty priamo v deštrukturalizácii (`variant = "primary"`).
- Vytiahneme `className` zvlášť (aby sme ho mohli pripojiť na koniec — volajúci môže
  dolaďovať), zvyšok `...props` (napr. `onClick`) rozprestrieme na `<button>`.
- `cn(...)` poskladá: base + zvolený variant + zvolená veľkosť + extra className.

## Pojmy
- **Union type** (`"a" | "b"`) = hodnota je presne jedna z možností.
- **`extends ...HTMLAttributes`** = zdedenie natívnych props HTML elementu.
- **`...props` (spread)** = "a zvyšok atribútov pošli ďalej".
- **`Record<K, V>`** = objekt, kde každý kľúč `K` musí mať hodnotu `V` (vynútená úplnosť).
- **`focus-visible`** = štýl len pri fokuse z klávesnice (a11y).

## Pre pohovor
"Button je typovo bezpečný: varianty/veľkosti sú union typy, mapy tried sú `Record`,
takže pridanie variantu je vynútené kompilátorom. Dedí natívne button atribúty cez
`ButtonHTMLAttributes`, farby z tokenov, a má focus-visible ring kvôli a11y."
