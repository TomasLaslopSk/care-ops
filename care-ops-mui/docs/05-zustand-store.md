# `src/store/useCarersStore.ts` — lokálny UI state (zustand)

## Čo to je
Malý globálny store na **UI stav** (zvolené filtre). Dôležité rozdelenie:
server dáta = React Query, UI stav (čo si používateľ navolil) = zustand.

## Celý kód
```ts
import { create } from "zustand";
import type { CarerStatus } from "../types";

export interface CarersState {
  region: string;
  status: CarerStatus | "";
  setRegion: (region: string) => void;
  setStatus: (status: CarerStatus | "") => void;
  clear: () => void;
}

const useCarersStore = create<CarersState>((set) => ({
  region: "",
  status: "",
  setRegion: (region) => set({ region }),
  setStatus: (status) => set({ status }),
  clear: () => set({ region: "", status: "" }),
}));

export default useCarersStore;
```

## Krok po kroku
- **`create<CarersState>((set) => ({...}))`** — vytvorí store. Callback dostane `set`
  (funkcia na zmenu stavu) a vráti počiatočný stav + akcie.
- **State + akcie spolu** — `region`, `status` sú dáta; `setRegion`, `setStatus`,
  `clear` sú funkcie, čo ich menia cez `set({...})`. `set` urobí merge do stavu.
- Typ `CarersState` dáva všetkému typy — `setStatus` neprijme nezmysel.

## Použitie v komponente — `useShallow`
```tsx
import { useShallow } from "zustand/shallow";

const { region, status, setRegion } = useCarersStore(
  useShallow((s) => ({ region: s.region, status: s.status, setRegion: s.setRegion })),
);
```
- Zo store si vyberáš len to, čo komponent potrebuje (selector).
- **`useShallow`** = porovnaj vybraný objekt **plytko** (po kľúčoch). Bez neho by
  selector vracal zakaždým nový objekt → komponent by sa prekresľoval pri každej
  zmene čohokoľvek. So `useShallow` sa prekreslí len keď sa zmení vybraná hodnota.
  Presne takto to robí `micro-fes` (`Filters.tsx`).

## Prečo nie všetko v React Query / useState
- **React Query** je na server dáta (majú cache, refetch, loading). Filtre nie sú
  server dáta — sú to voľby používateľa.
- **`useState`** by stačil, keby filtre potreboval jeden komponent. Lenže ich číta
  `Filters` (nastavuje) aj `Carers` page (posiela do hooku). Zdieľaný stav → zustand,
  bez prop drillingu.

## Pojmy
- **zustand** = minimalistický store (žiadne providery, žiadne boilerplate ako Redux).
- **selector** = funkcia, ktorá zo store vyberie výrez.
- **`useShallow`** = plytké porovnanie výberu → menej zbytočných re-renderov.
- **prop drilling** = posúvanie props cez veľa úrovní; zustand sa mu vyhne.

## Pre pohovor
"Rozlišujem server state (React Query) od UI state (zustand). Filtre sú UI state
zdieľaný medzi Filters a stránkou, tak sú v zustande, čítané cez `useShallow` kvôli
re-renderom — presne vzor micro-fes."
