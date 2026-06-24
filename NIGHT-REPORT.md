# Night run report — care-ops-console + care-api

Run of `NIGHT-PLAN.md` (scope: `care-ops-console`, `care-api`, top-level `*.md` only).
Everything was verified with real builds, test runs, and a live care-api boot in the
sandbox. The repo is left **green and a working MVP**.

## Features shipped (Task 0)

- **`GET /api/stats`** in care-api (operator/admin) → `{ todaysVisits, activeCarers,
  totalCarers, openAlerts: 0 }`, computed from the seed. Present in `openapi.yaml`
  (`StatsResponse` schema); types regenerated via `npm run gen:api`.
- **Dashboard** now reads `/api/stats` (new `useGetStats` hook) instead of counting
  full lists client-side. Shows `—` while loading and `!` on error.
- **Consistent loading / empty / error states**: `Clients` gained an empty state
  ("No clients yet.") to match the `Carers`/`CarersTable` pattern; `Visits` gained an
  empty state for filtered-empty results.
- **Visits status filter**: a `scheduled / in_progress / completed / missed` select on
  the Visits page; `useGetVisits(limit, status)` forwards `status` to the API and keys
  the query on it.
- **Visit detail task progress**: "X / Y done" count + a token-styled progress bar.
- **Swagger UI** at `http://localhost:3001/docs` confirmed working and rendering
  `/api/stats` (and `/openapi.yaml` returns 200).

## Persistence added? **Yes** (Task 0b)

`care-api/src/store.ts` already implements a JSON-file store (`care-api/data.json`,
node `fs`, **no new deps**): loads on boot, saves after every write. Persists the
mutable data only — `messages`, `agentRuns`, and per-visit mutations (`report`,
`checkInAt`, `checkOutAt`, `tasks[].done`, reassignment, runtime-created visits) — and
applies them as an overlay on the in-code static catalog. **Verified**: the night
agent-run posted in Task 6 (`RUN-1004`) was written to `data.json` and returned by the
admin `GET /api/agent-runs`, so it survives a restart and will show in the Agent runs UI.

## Tests — counts and pass/fail per level

| Level | Tool | Files | Tests | Result |
|---|---|---|---|---|
| Unit | Vitest + Testing Library | 6 | 14 | ✅ pass |
| Integration | Vitest + MSW | 3 | 9 | ✅ pass |
| **Unit + Integration total** | `npm run test` | **9** | **23** | ✅ **23/23 green** |
| E2E | Playwright | 4 (6 specs) | 6 | ⚠️ ready, not executed (see below) |

Unit: `Button`, `Stat`, `Badge`, `useCarersStore`, `useAuthStore`, `cn`.
Integration (MSW): `useGetCarers`, `useGetVisits`, `Carers` route render.
E2E specs: `auth`, `visits`, `scheduling`, `agent-runs` (+ `helpers.ts`).

`npm run build` (tsc + vite) is **green**. Build/test were re-run green after every
change set.

## What was skipped / unfinished (and why)

- **Playwright e2e was not executed.** `npx playwright install chromium` downloads a
  ~187 MB browser; the sandbox has a per-call time limit (~45 s) and the download does
  not resume across calls — it reached 80% before timing out on repeated attempts. The
  config + all 6 specs are complete and **validated** with `npx playwright test --list`
  (they compile and load). They will run as-is once a Chromium binary is present.
- **No git branch / PR.** `SCOPE.md` describes a branch+PR flow, but this checkout is
  not a git repo, so work was applied directly to the files (as NIGHT-PLAN expects).
- **Sandbox artifact**: a few `care-ops-console/dist_stale_*` folders remain. The
  original `dist/` was created by the host and the Linux sandbox cannot unlink it, so
  each verification build moved it aside. They are harmless and you can delete them on
  the host: `rm -rf care-ops-console/dist_stale_*`.

## New dependencies (only those allowed)

`msw` and `@playwright/test`, both as dev deps in `care-ops-console`. Persistence used
node `fs` only.

## How to run everything

```sh
# 1) Backend first (always)
cd care-api && npm install && npm run dev          # http://localhost:3001
#    Swagger UI:   http://localhost:3001/docs
#    Raw contract: http://localhost:3001/openapi.yaml
#    Stats:        GET http://localhost:3001/api/stats  (operator/admin token)

# 2) Console (web — JD vision)
cd care-ops-console && npm install --legacy-peer-deps
npm run dev                                        # http://localhost:5173
npm run build                                      # tsc -b && vite build  (green)
npm run gen:api                                    # regen src/lib/api-types.ts from openapi.yaml

# 3) Tests
cd care-ops-console
npm run test                                       # unit + integration — 23 tests, green
npx playwright install chromium                    # one-time (~187 MB) — needs network/time
npx playwright test                                # e2e: boots care-api + preview, runs 6 specs
npx playwright test --list                         # list specs without a browser (validates config)
```

Demo accounts: `operator@care.test` / `operator123`, `admin@care.test` / `admin123`,
`amara@care.test` / `carer123`, `relative@care.test` / `relative123`.

## Files touched

**Added (18):** `care-ops-console/TESTING.md`, `src/hooks/useGetStats.ts`,
`src/components/ui/Button.test.tsx`, `src/components/ui/Stat.test.tsx`,
`src/store/useCarersStore.test.ts`, `src/store/useAuthStore.test.ts`,
`src/test/handlers.ts`, `src/test/server.ts`, `src/test/utils.tsx`,
`src/hooks/useGetCarers.test.tsx`, `src/hooks/useGetVisits.test.tsx`,
`src/routes/Carers.test.tsx`, `playwright.config.ts`, `e2e/helpers.ts`,
`e2e/auth.spec.ts`, `e2e/visits.spec.ts`, `e2e/scheduling.spec.ts`,
`e2e/agent-runs.spec.ts`.

**Edited:** `src/routes/Dashboard.tsx`, `src/routes/Clients.tsx`, `src/routes/Visits.tsx`,
`src/routes/VisitDetail.tsx`, `src/hooks/useGetVisits.ts`, `src/types.ts`,
`src/queryKeys.ts`, `src/setupTests.ts`, `src/lib/api-types.ts` (regenerated),
`vite.config.ts`, `vitest.config.ts`, `package.json`, `TUTORIAL.md`.

care-api (`/api/stats`, persistence in `src/store.ts`) was already present in this
checkout and was verified rather than rewritten.
