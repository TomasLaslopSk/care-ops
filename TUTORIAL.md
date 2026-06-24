# Care Ops — kompletný tutoriál & poznámky

Toto je sprievodca celým systémom, ktorý sme postavili: čo to je, ako to spustiť,
ako veci do seba zapadajú, a ako to mapuje na JD (Cera Senior Frontend Engineer).
Prejdi si to, a potom ti to celé vysvetlím naživo.

---

## 1. Čo sme postavili (mapa)

Jeden backend, dva web frontendy (tá istá appka dvomi stackmi), mobilná appka, a
vrstva AI agentov so supervíziou v UI.

```
                         care-api  (Express + TS, in-memory, SSE, OpenAPI)
                          ▲   ▲   ▲
            /api          │   │   │        /api
        ┌─────────────────┘   │   └──────────────────┐
 care-ops-console        care-ops-mui          care-carer-kmp
 (JD vízia)              (realita micro-fes)    (mobil, Compose MP)
 Tailwind + TanStack     MUI + React Router      Android + iOS

 .agents/  ── nočný runner ──POST──► care-api ──► "Agent runs" obrazovka (admin)
```

| Projekt | Čo to je | Stack |
|---|---|---|
| `care-api` | zdieľaný backend | Express 5 + TS, in-memory, SSE, OpenAPI + Swagger |
| `care-ops-console` | web — JD vízia | React 19, TS strict, Tailwind v4, TanStack Router/Query, zustand |
| `care-ops-mui` | web — realita Cera | React 18, MUI 7 + Emotion, React Router 6, TanStack Query, zustand, **Vitest** |
| `care-carer-kmp` | mobil | Kotlin Multiplatform / Compose (zrkadlí `family_app`) |
| `.agents/` | nočné AI dev agenty + guardrails | Node runner + skills + scope |

---

## 2. Role a účty

| Rola | Kam sa prihlási | Čo vidí |
|---|---|---|
| **operator** | CareOps (web) | všetky visity/klienti, scheduling, reassign, chat (všetky kanály) |
| **admin** | CareOps (web) | všetko ako operator **+ Agent runs** (ostatní ju nevidia) |
| **carer** | mobil | len svoje visity; check-in → tasky → report → check-out |
| **relative** | mobil | len visity svojho klienta |

Demo účty (heslo v zátvorke): operator@care.test (operator123), admin@care.test (admin123),
amara@care.test (carer123), relative@care.test (relative123).

---

## 3. Ako to spustiť

Vždy **najprv backend**, potom frontendy. Každé v inom termináli.

```sh
# Backend (musí bežať prvý)
cd care-api && npm install && npm run dev          # http://localhost:3001

# Web — JD vízia
cd care-ops-console && npm install && npm run dev  # http://localhost:5173

# Web — realita micro-fes (na porovnanie)
cd care-ops-mui && npm install && npm run dev      # http://localhost:5174

# Mobil — v Android Studiu (Open priečinok care-carer-kmp), Run na emulátore
```

---

## 4. Kde si pozrieť API (náš "Swagger")

Backend má **Swagger UI**: keď beží `care-api`, otvor:

```
http://localhost:3001/docs
```

Vidíš tam všetky endpointy, schémy (Carer, Visit, AgentRun, **StatsResponse**…) a vieš ich
priamo vyskúšať. Dashboard ťahá čísla z `GET /api/stats` (počítané na serveri), nie počítaním
zoznamov na klientovi. Surový kontrakt je na `http://localhost:3001/openapi.yaml`
(a v súbore `care-api/openapi.yaml`).

**Perzistencia:** `care-api` je in-memory, ale mutovateľné dáta (chat správy, agent runs,
a zmeny vizít — report, check-in/out, hotové tasky, reassign, nové vizity) sa ukladajú do
`care-api/data.json` (node `fs`, žiadna DB). Načíta sa na štarte, zapisuje po každom write —
takže chat, reporty aj agent runs **prežijú reštart** servera. Statický katalóg
(carers/clients/users + base vizity) ostáva seed-nutý v kóde; persistovaný overlay sa
aplikuje navrch.

**Typy z kontraktu:** frontendy negenerujú typy ručne — bežia `npm run gen:api`, čo z
`openapi.yaml` vyrobí `src/lib/api-types.ts`, a doménové typy (`src/types.ts`) sú z nich
odvodené. Zmena API → typová chyba na frontende pri kompilácii. (JD: "types generated
from server contracts".)

---

## 5. Hlavné flowy (čo si vyskúšať)

**Scheduling + tasky (operator, web):** ľavý panel → Scheduling → vyber klienta, carera,
čas, a napíš tasky → Schedule visit. Objaví sa vo Visits. Tam vieš aj **reassignovať** carera.

**Visit lifecycle (carer, mobil):** otvor vizitu → **Check in** → odklikaj **tasky** →
napíš **report** → **Check out**. Je to gated (report sa odomkne až po check-ine, checkout
až po reporte). Operator to potom vidí na webe v detaile vizity (report, časy, tasky).

**Chat (real-time):** web operator má picker kanálov, mobil carer/relative svoj kanál.
Web používa **SSE** (napíš v jednom okne, objaví sa v druhom); mobil polluje.

**Agent supervision (admin, web):** prihlás sa ako admin → **Agent runs**. Vidíš návrhy
nočných agentov: diff, dôvod (rationale), provenance (skill/scope/prompt) → **Approve / Override**
(pri override zachytíš dôvod). Toto je presne JD "agent-supervision surfaces".

---

## 6. AI agenti — ako sa to napája na Clauda

Žiadna mágia, len HTTP cez backend (detail v `.agents/README.md`):

```
nočný schedule → .agents/run-agent.mjs → (Claude agent na branchi) → git PR
                          │
                          └─ POST /api/agent-runs  (prompt, diff, rationale, provenance)
                                        │
   web (admin) ◄── GET /api/agent-runs ─┘    a späť: POST decision (approve/override)
```

Vyskúšaj loop hneď (bez LLM):
```sh
node .agents/run-agent.mjs --role reactDev --task "Add empty states to Carers table"
# potom: prihlás sa ako admin → Agent runs → Approve/Override
```

`--real` režim spustí Claude CLI headless na branchi a zachytí diff. Nočné spúšťanie:
launchd/cron lokálne (musí dosiahnuť na `localhost:3001`) — návod v `.agents/README.md`.

---

## 7. Testy (tvoj QA terén)

`care-ops-console` má teraz **tri úrovne testov** (detail v `care-ops-console/TESTING.md`):

1. **Unit** (Vitest + Testing Library) — komponenty (`Button`, `Stat`, `Badge`) a
   zustand store (`useCarersStore`, `useAuthStore`).
2. **Integration** (Vitest + **MSW**) — data hooky (`useGetCarers`, `useGetVisits`) a
   render obrazovky `Carers` proti mockovanému API (MSW zachytáva axios na úrovni siete).
3. **E2E** (**Playwright**) — `auth`, `visits`, `scheduling`, `agent-runs` proti reálnemu
   `care-api` + produkčnému buildu cez `vite preview` (config boot-uje oba servery sám).

```sh
cd care-ops-console && npm run test        # unit + integration (23 testov / 9 súborov, zelené)
npx playwright install chromium            # jednorazovo stiahne browser (~187 MB)
npx playwright test                        # E2E (6 testov / 4 súbory)
```

`care-ops-mui` má tiež **Vitest + Testing Library** (presný micro-fes setup): `npm run test`
(testy `StatusChip` + `useAuthStore`). Ďalšie QA úlohy sú v `.agents/backlog.md`.

---

## 8. Ako to mapuje na JD (talking points)

| JD požiadavka | Kde to máme |
|---|---|
| React 19, TS strict | `care-ops-console` |
| Realita ich kódu (MUI, RR6, React 18) | `care-ops-mui` (zrkadlí `micro-fes`) |
| TanStack Query, live state | data hooky + chat SSE |
| types generated from contracts | OpenAPI → `gen:api` → `api-types.ts` |
| real-time (SSE) | chat na webe |
| token-driven design system | Tailwind `@theme` (console), MUI theme (mui) |
| Kotlin Multiplatform mobil | `care-carer-kmp` (zrkadlí `family_app`) |
| **agent-supervision (provenance, override, rationale)** | **Agent runs obrazovka + `.agents/`** |
| testing, quality | Vitest + Testing Library, QA backlog |
| reduce complexity | jeden backend, zdieľané vzory, contract-first typy |

Bonus príbeh: to isté (migrácia, AI-native tempo) si reálne spravil na produkčnom
eshope `luxvlasy`.

---

## 9. Ďalšie kroky (klon micro-fes)

Čo už zrkadlíme z `micro-fes`: provider stack, `hooks/useGetX` + React Query vzor,
`queryKeys`, zustand + `useShallow`, MUI + `sx`, MSW, Vitest + Testing Library, OpenAPI typy.

Plný "klon" by ďalej pridal: Nx monorepo s viacerými micro-frontendmi (chat, finance,
scheduler ako samostatné appky), zdieľané `packages/*` (api, ui, utils), a module federation.
To je veľký krok — odporúčam ho robiť cez ten agentický PR-flow (po jednej appke, s review).
