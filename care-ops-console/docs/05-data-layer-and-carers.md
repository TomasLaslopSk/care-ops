# Data layer + Carers screen (TanStack Query, zustand, RHF, types z kontraktu)

Tu sa console napája na zdieľaný backend `care-api` a stavia plnú Carers obrazovku.
Zámerne **1:1 s `care-ops-mui`** — rovnaká logika, len Tailwind namiesto MUI a
TanStack Router namiesto React Router. Porovnaj si súbory vedľa seba.

## Súbory
```
src/lib/api-types.ts        — VYGENEROVANÉ z ../care-api/openapi.yaml (nedotýkať sa)
src/types.ts                — doménové typy odvodené z api-types (Carer, CarersResponse…)
src/lib/axios.ts            — zdieľaná axios inštancia (baseURL "/api")
src/queryKeys.ts            — kľúče React Query
src/store/useCarersStore.ts — zustand: filtre (UI state)
src/hooks/useGetCarers.ts   — React Query dotaz
src/components/Filters.tsx      — selecty napojené na store
src/components/CarersTable.tsx  — tabuľka + loading/empty/error
src/components/NewCarerForm.tsx — RHF + yup formulár
src/components/ui/Field.tsx     — TextField/SelectField primitívy (Tailwind)
src/routes/Carers.tsx           — zlepenie + toast
```

## Types z kontraktu — kľúčová vec
```ts
// src/types.ts
import type { components } from "./lib/api-types";
export type Carer = components["schemas"]["Carer"];
export type CarersResponse = components["schemas"]["CarersResponse"];
```
`api-types.ts` je vygenerovaný z `care-api/openapi.yaml` cez `npm run gen:api`.
Doménové typy z neho len odvodíme. Dôsledok: keď backend zmení kontrakt (napr.
premenuje pole), po `gen:api` ti TypeScript **červeno ukáže** každé miesto, kde sa to
rozbilo. To je „end-to-end types“ z JD — typ tečie zo servera až do komponentu.

## React Query + axios + store — identické s mui
`lib/axios.ts`, `queryKeys.ts`, `store/useCarersStore.ts`, `hooks/useGetCarers.ts`
sú obsahovo zhodné s `care-ops-mui`. Vysvetlenie krok-po-kroku je v
[`care-ops-mui/docs/04-data-query-axios.md`](../../care-ops-mui/docs/04-data-query-axios.md)
a [`05-zustand-store.md`](../../care-ops-mui/docs/05-zustand-store.md) — neopakujem ho.
Pointa: server state = React Query (s `queryKey` vrátane filtrov → auto refetch/cache),
UI state (filtre) = zustand cez `useShallow`.

## Rozdiely oproti mui (to zaujímavé)

**1. Štýlovanie — Tailwind namiesto MUI `sx`.**
MUI: `<Box sx={{ display:"flex", gap:2 }}>` → tu: `<div className="flex gap-3">`.
MUI `<Select>`/`<TextField>` → tu natívne `<select>`/`<input>` obalené v malých
primitívoch `ui/Field.tsx`, naštýlované tokenmi (`bg-surface-2`, `border-border`).
Vizuálne takmer rovnaké, ale postavené ručne z utility tried — vidno, koľko ti MUI
„dá zadarmo“ (dropdowny, focus stavy, varianty).

**2. Tabuľka.**
mui: `<Table>/<TableRow>/<TableCell>` (hotové MUI komponenty). Tu: obyčajné
`<table>` v `Card` s Tailwind triedami. Status = náš `Badge` (z Phase 1) namiesto MUI `Chip`.

**3. Formulár.**
Logika identická (react-hook-form + yup + `Controller` + `yup.InferType`). Líši sa len
to, čo `Controller` renderuje: naše `TextField`/`SelectField` namiesto MUI polí.

**4. Toast.**
mui má hotový `<Snackbar>`. Tu jednoduchý `fixed` div + `setTimeout` v `useEffect`.

## Pre pohovor
"Tú istú Carers obrazovku som postavil dvakrát proti rovnakému backendu: raz v MUI,
raz v Tailwind/TanStack. Data layer (React Query + axios + zustand + types z OpenAPI
kontraktu) je zdieľaný vzor; líši sa len prezentačná vrstva. Ukazuje to, že rozumiem
podstate (server vs UI state, contract-first typy) nezávisle od konkrétnej UI knižnice."
