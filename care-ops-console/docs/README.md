# Care Ops Console — dokumentácia ku kódu

Toto je učebný sprievodca. Ku **každému komponentu a hooku** je tu jeden markdown súbor,
kde si krok po kroku rozoberieme, čo daný kód robí a prečo.

Cieľ: aby si sa k tomu vedel kedykoľvek vrátiť, naštudovať si to a vedieť to vysvetliť
(napr. na pohovore na Cera Senior Frontend Engineer).

> Pozn.: vysvetlenia sú po slovensky, kód a texty v projekte sú po anglicky (konvencia projektu).

## Ako čítať tieto docs

Každý súbor má rovnakú štruktúru:

1. **Čo to je** — jedna veta, načo komponent/hook slúži.
2. **Celý kód** — aktuálny obsah súboru.
3. **Krok po kroku** — riadok po riadku / blok po bloku rozbor.
4. **Pojmy** — React/TS pojmy, ktoré sa tam objavili.
5. **Pre pohovor** — 1–2 vety, ako to spojiť s JD.

## Obsah

| Súbor v projekte | Doc | Čo to je |
|---|---|---|
| `src/main.tsx` | [01-main.md](./01-main.md) | Vstupný bod appky (mount React do DOM) |
| `src/router.tsx` | [02-router.md](./02-router.md) | TanStack Router — definícia routovacieho stromu |
| `src/components/Layout.tsx` | [03-Layout.md](./03-Layout.md) | App shell — sidebar + topbar + obsah |
| `src/routes/*.tsx` | [04-route-components.md](./04-route-components.md) | Stránky: Dashboard, Visits, Carers |

### Design system (Phase 1) — `docs/ui/`

| Súbor v projekte | Doc | Čo to je |
|---|---|---|
| `src/lib/cn.ts` | [ui/00-cn-helper.md](./ui/00-cn-helper.md) | Helper na spájanie CSS tried |
| `src/components/ui/Button.tsx` | [ui/01-Button.md](./ui/01-Button.md) | Tlačidlo s variantmi/veľkosťami |
| `src/components/ui/Card.tsx` | [ui/02-Card.md](./ui/02-Card.md) | Surface kontajner |
| `src/components/ui/Badge.tsx` | [ui/03-Badge.md](./ui/03-Badge.md) | Stavový pill štítok |
| `src/components/ui/Stat.tsx` | [ui/04-Stat.md](./ui/04-Stat.md) | KPI dlaždica (kompozícia Card) |

### Data layer + Carers (TanStack Query, zustand, RHF, types z kontraktu)

| Súbor | Doc | Čo to je |
|---|---|---|
| `src/lib/axios.ts`, `queryKeys.ts`, `store/`, `hooks/useGetCarers.ts`, `types.ts`, `components/*` | [05-data-layer-and-carers.md](./05-data-layer-and-carers.md) | Napojenie na `care-api`, React Query, zustand, formulár; 1:1 s mui trackom |
| `hooks/useGetVisits.ts`, `routes/Visits.tsx`, `hooks/useChatStream.ts` + chat hooky, `routes/Chat.tsx` | [06-visits-and-chat-sse.md](./06-visits-and-chat-sse.md) | Visits tabuľka + Chat s real-time cez SSE |

## Custom hooky

Prvý vlastný hook je `src/hooks/useGetCarers.ts` (React Query dotaz na `care-api`),
rozobratý v [05-data-layer-and-carers.md](./05-data-layer-and-carers.md).

## Mapa fáz

Celý plán je v [`../ROADMAP.md`](../ROADMAP.md). Tieto docs pokrývajú **Phase 0 (scaffold)**.
