# Night plan — prompts for the scheduled run (review me first)

Goal: by morning, `care-ops-console` (React 19 + Tailwind) + `care-api` are a tidy,
**functional MVP** with three test levels (unit / integration / e2e), nice docs, and a
Swagger-style API view. Scope is intentionally **console + care-api + docs only**
(not care-ops-mui, not the KMP app) to stay focused and cheap.

## Task 0 — Development (features + polish), do this FIRST
Ship real, working features (not just tests). Keep each small + verified.
- **care-api: `GET /api/stats`** (auth: operator/admin) → `{ todaysVisits, activeCarers, totalCarers, openAlerts: 0 }` computed from the seed. Add it to `openapi.yaml` (+ `StatsResponse` schema), regenerate types (`npm run gen:api` in care-ops-console), and make the **Dashboard** use this endpoint instead of counting client-side.
- **care-ops-console polish (consistent loading / empty / error states):** apply the same pattern used on Visits to the **Carers** and **Clients** tables.
- **Visits filter:** add a status filter (`scheduled / in_progress / completed / missed`) on the Visits page that passes `status` to `useGetVisits` (the API already supports it).
- **Visit detail: task progress** — show "X / Y tasks done" with a small progress bar (token-driven styling).
- Confirm the **Swagger UI** at `http://localhost:3001/docs` works and renders the new `/api/stats`. If anything about it is broken, fix it. (It already exists in care-api/src/server.ts.)
Every feature must keep `npm run build` + `npm run test` green. Cover the new bits with tests in Tasks 1–3.

## Task 0b — Persistence (so data survives restarts) — do this in care-api
Right now care-api is in-memory; everything resets on restart. Add a **simple JSON-file
store** (no new deps — use node fs) so the mutable data persists:
- File: `care-api/data.json`. On boot, if it exists, load it; otherwise seed as today and write it.
- Persist the MUTABLE data only: `messages`, `agentRuns`, and per-visit mutations
  (`report`, `checkInAt`, `checkOutAt`, `tasks[].done`). Keep the static catalog
  (carers/clients/visits base, users) seeded in code; apply the persisted overlay on top.
- Save after every write (post message, decision, check-in/out, report, task toggle, ingest run, create visit).
- Keep it small + readable. (SQLite is a future upgrade; JSON file is the safe step now.)
This makes chat, visit reports, and agent runs survive a restart — including the run below.

## Task 6 — Make THIS run show up in the Agent Runs UI (do this LAST)
After everything is done and green, POST a run record so tonight's work is visible:
`POST http://localhost:3001/api/agent-runs` with header `x-agent-key: dev-agent-key` and body:
```
{ "agent": "nightAgent", "project": "care-ops-console + care-api",
  "task": "Overnight MVP: features + persistence + unit/integration/e2e + docs",
  "summary": "<one line of what you shipped>",
  "rationale": "<what you did + which checks passed/failed>",
  "diff": "<short stat: files changed, tests added>",
  "provenance": { "skill": ".agents (night run)", "scope": "care-ops-console + care-api + docs", "prompt": "NIGHT-PLAN.md" } }
```
Because Task 0b adds persistence, this record survives to the morning, so when the user
opens CareOps as admin, **this run appears in Agent runs** to approve/override.

## Hard rules for the scheduled agent
- Only edit: `care-ops-console/**`, `care-api/**`, and top-level `*.md` docs.
- Never touch: `care-ops-mui/**`, `care-carer-kmp/**`, `.github/**`, anything in SCOPE.md "never touch".
- After every change set: run `npm run build` and `npm run test` in `care-ops-console`. **If red, revert that change.** Leave the repo green.
- Keep diffs small and readable. Don't add deps beyond those listed below.
- Write a short `NIGHT-REPORT.md` at the end: what was done, what passed, what was skipped and why.

## Task 1 — UNIT tests (Vitest + Testing Library) in care-ops-console
Add focused unit tests (co-located `*.test.ts(x)`):
- `components/ui/Button.test.tsx` — renders label; applies variant + size classes; respects `disabled`.
- `components/ui/Stat.test.tsx` — renders label + value + optional hint.
- `store/useCarersStore.test.ts` — setRegion/setStatus/clear update state.
- `store/useAuthStore.test.ts` — setAuth/logout.
Run `npm run test`; all green.

## Task 2 — INTEGRATION tests (Vitest + MSW)
- Add MSW (`msw`) as a dev dep; create `src/test/server.ts` with handlers for `/api/carers`, `/api/visits`, `/api/auth/login` returning seeded shapes (mirror care-api).
- Wire MSW into `setupTests.ts` (listen/reset/close).
- Test the data hooks against MSW with a React Query wrapper:
  - `hooks/useGetCarers` returns mocked carers; filter param reflected in the request.
  - `hooks/useGetVisits` returns mocked visits.
- Render-level integration: `routes/Carers` renders rows from the mocked API (wrap in QueryClientProvider).

## Task 3 — E2E (Playwright) against the real care-api
- Add `@playwright/test` (dev dep) + `playwright.config.ts` with a `webServer` block that boots `care-api` (`npm --prefix ../care-api run dev`) and the console (`npm run preview` after build), baseURL the preview port.
- `e2e/` specs:
  - `auth.spec.ts` — operator logs in; carer/relative are rejected (operator-only message).
  - `visits.spec.ts` — operator opens Visits, reassigns a carer, opens a visit detail.
  - `scheduling.spec.ts` — operator schedules a visit with tasks; it appears in Visits.
  - `agent-runs.spec.ts` — admin sees Agent runs; approve + override (capture note).
- Try `npx playwright install chromium` and run `npx playwright test`. If browsers can't install in the environment, leave the config + specs ready and note it in NIGHT-REPORT.md.

## Task 4 — Docs + OpenAPI (Swagger-style)
- `care-ops-console/TESTING.md` — explains the 3 levels (unit/integration/e2e), how to run each, what each covers, and the testing philosophy (your QA angle for the JD).
- Confirm `care-api` Swagger at `/docs` works; add a one-paragraph "How to read the API" to `TUTORIAL.md` if missing.
- Update `TUTORIAL.md` testing section to point at the new tests + counts.

## Task 5 — Final verify
- `care-ops-console`: `npm run build` green, `npm run test` green (unit + integration).
- `care-api`: boots (`tsx src/server.ts`), `/docs` + `/openapi.yaml` respond.
- Write `NIGHT-REPORT.md` (root of tilea) summarizing results + how to run everything.

## Allowed new dev deps (only these)
`msw`, `@playwright/test`. Nothing else.
