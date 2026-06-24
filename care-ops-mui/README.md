# Care Ops — MUI track

Druhý učebný projekt. Kým `care-ops-console` stavia **JD víziu** (Tailwind tokeny,
TanStack Router, React 19), tento projekt verne kopíruje **reálny stack `micro-fes`**,
teda to, čo budeš písať prvý deň v Cera:

- **Vite** + **React 18** + **TypeScript strict**
- **MUI 7 + Emotion** (UI), vlastný `ceraTheme` (zdroj pravdy pre farby/tvar)
- **react-router-dom 6** (lazy + Suspense + Routes)
- **TanStack React Query** (server state) + **axios** inštancia
- **zustand** (lokálny UI state — filtre), čítané cez `useShallow`
- **react-hook-form + yup** (formuláre s validáciou)
- **MSW** (mock API v dev) — presne ako `packages/mocks`

## Čo appka robí
Shell (sidebar + topbar) + stránky **Dashboard / Visits / Carers** — identické s
`care-ops-console`. Carers: filtrovateľný zoznam (MUI tabuľka), formulár (RHF + yup),
loading/empty/error stavy.

Dáta ťahá zo zdieľaného **`care-api`** backendu (nie z MSW — MSW je ponechané v
`src/mocks` ako referencia, vypnuté cez `USE_MOCKS = false` v `index.tsx`).

## Spustenie
Najprv musí bežať backend (viď `../CARE-OPS.md`):
```sh
cd ../care-api && npm install && npm run dev   # http://localhost:3001

# potom tu:
npm install
npm run dev      # http://localhost:5174
npm run gen:api  # (voliteľné) pregeneruj typy z ../care-api/openapi.yaml
```

## Mapa na micro-fes
| Tu | V micro-fes |
|---|---|
| `src/index.tsx` (provider stack) | `apps/*/src/index.tsx` |
| `src/theme/ceraTheme.ts` | `@ceracare/dcp-ui` createCeraUiTheme |
| `src/lib/axios.ts` | `@ceracare/dcp-providers` AxiosProvider/useAxios |
| `src/queryKeys.ts` | `apps/*/src/queryKeys.ts` |
| `src/hooks/useGetCarers.ts` | `apps/*/src/hooks/useGetX.ts` |
| `src/store/useCarersStore.ts` | `apps/*/src/store/useXStore.ts` |
| `src/components/Filters.tsx` | `apps/carers/src/components/Filters.tsx` |
| `src/mocks/*` | `packages/mocks/*` (teraz vypnuté, máme reálny backend) |

Detailné rozbory každého súboru sú v [`docs/`](./docs). Ako to celé beží spolu
s backendom a druhým frontendom: [`../CARE-OPS.md`](../CARE-OPS.md).
