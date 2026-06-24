# Data layer — React Query + axios + queryKeys

Tri súbory, čo tvoria "ako appka berie dáta zo servera": `lib/axios.ts` (HTTP klient),
`queryKeys.ts` (kľúče cache), `hooks/useGetCarers.ts` (samotný dotaz). Presný vzor `micro-fes`.

---

## `src/lib/axios.ts`
```ts
import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  timeout: 20000,
});
```
- `axios.create(...)` — jedna nakonfigurovaná inštancia (base URL, timeout), ktorú
  zdieľajú všetky dotazy. V `micro-fes` je v `AxiosProvider` a navyše má **interceptory**
  (automaticky pridá auth token, obnoví ho pri 401). My auth nemáme, tak je to holé.
- `baseURL: "/api"` → požiadavky idú na `/api/...`, čo v dev zachytí MSW.

---

## `src/queryKeys.ts`
```ts
enum QueryKeys {
  getCarers = "get-carers",
}
export default QueryKeys;
```
- React Query identifikuje každý dotaz **query key**-om (kľúč v cache). Keby si stringy
  "get-carers" písal ručne na viacerých miestach, jeden preklep = rozbitá cache.
- Enum = jeden zdroj pravdy. Presne ako `apps/*/src/queryKeys.ts` v micro-fes.

---

## `src/hooks/useGetCarers.ts`
```ts
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";
import type { CarersResponse, CarerStatus } from "../types";
import queryKeys from "../queryKeys";

const useGetCarers = (region: string, status: CarerStatus | "") =>
  useQuery<CarersResponse, Error>({
    queryKey: [queryKeys.getCarers, region, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (region) params.set("region", region);
      if (status) params.set("status", status);
      const { data } = await api.get<CarersResponse>(`/carers?${params.toString()}`);
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 60000,
    retry: 0,
  });

export default useGetCarers;
```

### Krok po kroku
- **Custom hook** — obyčajná funkcia začínajúca `use...`, vnútri volá `useQuery`.
  Zapuzdruje "ako sa berú opatrovatelia", aby to komponent nemusel riešiť.
- **`useQuery<CarersResponse, Error>`** — generické typy: prvý = typ dát pri úspechu,
  druhý = typ chyby. Vďaka tomu `data` má typ `CarersResponse | undefined`.
- **`queryKey: [queryKeys.getCarers, region, status]`** — KĽÚČOVÉ: kľúč obsahuje aj
  filtre. Keď sa zmení `region`/`status`, zmení sa kľúč → React Query si pre tú
  kombináciu drží **samostatnú cache** a sám refetchne. Žiadny manuálny `useEffect`.
- **`queryFn`** — async funkcia, ktorá reálne stiahne dáta (cez našu axios inštanciu).
  Poskladá query params len z vyplnených filtrov.
- **Options:**
  - `refetchOnWindowFocus: false` — nerefetchuj pri každom prepnutí okna.
  - `staleTime: 60000` — dáta sú "čerstvé" 60s; dovtedy ich neťahá znova.
  - `retry: 0` — pri chybe neskúšaj opakovane.
  Presne tie isté hodnoty ako v micro-fes hookoch.

### Ako to použije komponent
```tsx
const { data, isLoading, isError } = useGetCarers(region, status);
```
Komponent dostane `isLoading`, `isError`, `data` zadarmo — loading/error stavy
nemusí riešiť ručne.

## Pre pohovor
"Server state je čisto React Query — custom `useGetX` hook s `queryKey` vrátane filtrov,
takže zmena filtra automaticky refetchne a cachuje per-kombináciu, bez `useEffect`
plumbingu. Axios je zdieľaná inštancia (u nich s auth interceptormi v AxiosProvider).
Query keys sú v enume, aby cache nebola stringly-typed. Toto je 1:1 ich vzor."
