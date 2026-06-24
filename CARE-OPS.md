# Care Ops — učebný full-stack

> 📘 Kompletný sprievodca (spustenie, flowy, Swagger, AI agenti, talking points) je v **[TUTORIAL.md](./TUTORIAL.md)**.


Tri projekty, ktoré spolu tvoria jednu appku, aby si sa naučil presne Cera stack
a vedel porovnať dva frontend prístupy proti **tomu istému** backendu.

```
care-api            ← jeden zdieľaný backend (Express + TS, in-memory, SSE, OpenAPI)
   ▲        ▲
   │ /api   │ /api
care-ops-console   care-ops-mui
(JD vízia)         (realita micro-fes)
```

| Projekt | Čo to je | Stack |
|---|---|---|
| **care-api** | zdieľaný backend, reálne API | Express 5 + TS, in-memory, SSE, OpenAPI |
| **care-ops-console** | frontend — JD vízia | Tailwind v4 tokeny, TanStack Router, React 19 |
| **care-ops-mui** | frontend — realita Cera | MUI 7 + Emotion, React Router 6, React 18 |
| **care-carer-kmp** | mobilná carer appka | Kotlin Multiplatform / Compose (zrkadlí `family_app`) — Android + iOS |

Oba frontendy zobrazujú **identickú appku** (shell, Dashboard, Visits, Carers) a ťahajú
**tie isté dáta** z `care-api`. Jediný rozdiel je stack — ideálne na porovnanie
„ten istý problém dvoma spôsobmi“.

## Spustenie celého stacku
Potrebuješ 2–3 terminály. **Najprv backend**, potom frontend(y):

```sh
# Terminál 1 — backend (musí bežať prvý)
cd care-api && npm install && npm run dev        # http://localhost:3001

# Terminál 2 — JD vízia frontend
cd care-ops-console && npm install && npm run dev # http://localhost:5173

# Terminál 3 — realita frontend (voliteľne, na porovnanie)
cd care-ops-mui && npm install && npm run dev     # http://localhost:5174
```

Oba frontendy majú vo `vite.config` proxy `/api → localhost:3001`, takže keď beží
backend, dáta sa načítajú samé.

## Auth + roly
Prihlásenie email+heslo (`POST /api/auth/login` → token + user). Token ide v
`Authorization: Bearer` hlavičke (axios interceptor na webe, Ktor na mobile).

**Kam sa kto smie prihlásiť** (vynútené na backende cez `app` parameter aj na frontende):

| Aplikácia | Smú sa prihlásiť |
|---|---|
| **CareOps** (web — `care-ops-console`, `care-ops-mui`) | **operator** a **admin** |
| **Carer app** (mobil — `care-carer-kmp`) | len **carer** a **relative** |

`admin` (admin@care.test / admin123) vidí navyše obrazovku **Agent runs** (ostatní nie).

**Čo kto vidí** (backend filtruje podľa roly a `guid`):

| Rola | Visits | Chat |
|---|---|---|
| **operator** | všetky + môže assignovať/reassignovať | všetky kanály (picker) |
| **carer** | len svoje (`carerId`) | svoj kanál (= `carerId`) |
| **relative** | visity svojho **klienta** (`relatedClientId`) | kanál klienta (= `clientId`) |

Carer v mobile otvorí **detail vizity** a urobí **check-in → report → check-out**
(`POST /visits/:id/check-in`, `PUT /visits/:id/report`, `POST /visits/:id/check-out`;
povolené len pridelenému carerovi alebo operatorovi). Stav vizity prechádza
scheduled → in_progress → completed.

Demo účty (seedované):

| Email | Heslo | Rola | Appka |
|---|---|---|---|
| operator@care.test | operator123 | operator | CareOps |
| amara@care.test | carer123 | carer (C-1000) | mobil |
| farah@care.test | carer123 | carer (C-1005) | mobil |
| relative@care.test | relative123 | relative → klient CL-2000 | mobil |

**Assign / reassign:** operator na stránke **Visits** prepíše carera vo vizite cez
dropdown (`PATCH /api/visits/:id`). Stránka **Clients** (operator) ukazuje klientov.

## Mobilná carer appka
`care-carer-kmp` (Kotlin Multiplatform / Compose) zrkadlí `ceracare/family_app`.
Carer sa prihlási a vidí svoje visity z `care-api`. Build/spustenie v Android Studiu —
detaily a poznámky v `care-carer-kmp/README.md`.

## AI agent supervision (JD: „agent-supervision surfaces“)
Nočné AI agenty navrhujú zmeny v appkách a zapisujú „run record" (prompt, diff, dôvod,
provenance) do `care-api`. **Admin** ich na obrazovke **Agent runs** schvaľuje/prepisuje
(s zachytením dôvodu). Spojka web↔Claude je len HTTP cez backend — detail a runner sú
v [`.agents/`](./.agents/README.md). Vyskúšaj: `node .agents/run-agent.mjs --role reactDev --task "..."`.

## Swagger / API dokumentácia
Keď beží `care-api`: **http://localhost:3001/docs** (Swagger UI), kontrakt na `/openapi.yaml`.

## Testy
`care-ops-mui` má Vitest + Testing Library (`npm run test`) — micro-fes setup.

## Types z kontraktu (JD: „types generated from server contracts“)
`care-api/openapi.yaml` je zdroj pravdy. Oba frontendy z neho generujú TS typy:
```sh
# v ktoromkoľvek frontende, keď zmeníš API kontrakt
npm run gen:api      # openapi.yaml -> src/lib/api-types.ts
```
Doménové typy (`Carer`, `CarersResponse`, …) sú odvodené z týchto generovaných typov
(`src/types.ts`), takže keď sa zmení backend kontrakt, frontend okamžite vidí typovú
nezhodu pri kompilácii.

## Obrazovky (v oboch frontendoch, identické)
- **Dashboard** — stat karty + design-system ukážka.
- **Visits** — tabuľka návštev z `care-api` + reassign carera (dropdown).
- **Carers** — filtrovateľný zoznam + formulár (RHF + yup).
- **Clients** — zoznam klientov (operator).
- **Chat** — real-time ops kanál cez **SSE** (napíš v jednom okne, objaví sa v druhom).

## Real-time (SSE) — napojené
`care-api` má `/api/events` (SSE): streamuje `message` (nová chat správa, broadcast
všetkým) a `alert` (každých ~6s). Chat stránka počúva cez `EventSource` a patchuje
React Query cache (`setQueryData`) → živé UI bez pollingu. Alert feed na Dashboarde
je ďalší voliteľný krok.

## Dokumentácia
Každý projekt má `docs/` s rozborom súborov krok-po-kroku (po slovensky).
Začni v `care-ops-console/docs/README.md` a `care-ops-mui/docs/README.md`.
