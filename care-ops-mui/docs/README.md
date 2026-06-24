# Care Ops MUI track — dokumentácia ku kódu

Učebný sprievodca, rovnaký formát ako v `care-ops-console`. Ku každému súboru jeden
rozbor (po slovensky, kód po anglicky).

Tento projekt verne kopíruje **reálny stack `micro-fes`** (čo budeš písať v Cera prvý
deň), kým `care-ops-console` stavia JD víziu. Užitočné je čítať ich vedľa seba —
v "pre pohovor" sekciách porovnávam oba prístupy.

## Obsah

| Súbor | Doc | Téma |
|---|---|---|
| `src/index.tsx` | [01-index-providers.md](./01-index-providers.md) | Provider stack (Router→Query→Theme), MSW bootstrap |
| `src/theme/ceraTheme.ts` | [02-theme.md](./02-theme.md) | MUI theme ako zdroj pravdy (vs Tailwind tokeny) |
| `src/App.tsx` | [03-App-routing.md](./03-App-routing.md) | react-router-dom 6 + lazy + Suspense (vs TanStack Router) |
| `src/lib/axios.ts` + `src/hooks/useGetCarers.ts` + `src/queryKeys.ts` | [04-data-query-axios.md](./04-data-query-axios.md) | React Query + axios + queryKeys |
| `src/store/useCarersStore.ts` | [05-zustand-store.md](./05-zustand-store.md) | zustand + useShallow |
| `src/mocks/*` | [06-msw-mocks.md](./06-msw-mocks.md) | MSW mock API |
| `src/components/*` + `src/components/NewCarerForm.tsx` | [07-mui-components-and-form.md](./07-mui-components-and-form.md) | MUI komponenty + react-hook-form + yup |
| `src/components/Layout.tsx` + `src/pages/*` | [08-shell-and-pages.md](./08-shell-and-pages.md) | App shell + Dashboard/Visits (zhoda s console) |
| `hooks/useGetVisits.ts`, `hooks/useChatStream.ts` + chat hooky, `pages/Visits.tsx`, `pages/Chat.tsx` | [09-visits-and-chat-sse.md](./09-visits-and-chat-sse.md) | Visits tabuľka + Chat real-time (SSE) |

## Tailwind track vs MUI track — rýchle porovnanie

| Vec | care-ops-console (JD) | care-ops-mui (realita) |
|---|---|---|
| Štýlovanie | Tailwind v4, tokeny v CSS `@theme` | MUI + Emotion, theme v JS `createTheme` |
| Routing | TanStack Router (type-safe strom) | react-router-dom 6 (`<Routes>/<Route>`) |
| React | 19 | 18.3 |
| Server data | (príde) TanStack Query | TanStack Query ✅ (rovnaké) |
| Local state | (príde) | zustand ✅ |
| Formuláre | — | react-hook-form + yup |
| Mock API | Express server | MSW |
