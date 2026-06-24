# Testing — care-ops-console

This app is tested at **three levels**, smallest-to-largest. The split is deliberate:
each level catches a different class of bug, runs at a different speed, and gives a
different kind of confidence. Lower levels are fast and run on every save; higher
levels are slower and prove the pieces actually work together against the real API.

```
        ┌─────────────────────────────────────────────┐  slow, few
        │  E2E (Playwright)  — real care-api + preview  │
        ├─────────────────────────────────────────────┤
        │  Integration (Vitest + MSW) — hooks/screens   │
        ├─────────────────────────────────────────────┤
        │  Unit (Vitest + Testing Library) — components │  fast, many
        └─────────────────────────────────────────────┘
```

## Level 1 — Unit (Vitest + Testing Library)

Pure, isolated pieces: presentational components and zustand stores. No network,
no providers. These are the fast feedback loop you run constantly.

- `src/components/ui/Button.test.tsx` — renders its label; applies variant + size
  classes; defaults to primary/md; respects `disabled`.
- `src/components/ui/Stat.test.tsx` — renders label + value; shows the optional hint;
  omits it when absent.
- `src/components/ui/Badge.test.tsx` — renders children; applies tone classes.
- `src/store/useCarersStore.test.ts` — `setRegion` / `setStatus` / `clear` update state.
- `src/store/useAuthStore.test.ts` — `setAuth` / `logout` set and clear the session.
- `src/lib/cn.test.ts` — class-name helper.

## Level 2 — Integration (Vitest + MSW)

The data layer wired to a **mocked HTTP API**. [MSW](https://mswjs.io) intercepts the
real `axios` requests at the network boundary, so the hooks, query keys, axios
instance, and React Query are all exercised together — only the server is faked.
The mock handlers mirror care-api's response shapes (`{ data, total }`).

- `src/test/handlers.ts` — MSW request handlers for `/api/auth/login`, `/api/carers`,
  `/api/visits` (with seeded data + filter support).
- `src/test/server.ts` — the `setupServer` instance.
- `src/setupTests.ts` — starts MSW (`listen` / `resetHandlers` / `close`) around the suite.
- `src/hooks/useGetCarers.test.tsx` — returns mocked carers; the `region` / `status`
  filters are forwarded into the request URL.
- `src/hooks/useGetVisits.test.tsx` — returns mocked visits; the `status` filter narrows
  the result.
- `src/routes/Carers.test.tsx` — render-level: the Carers screen paints rows from the
  mocked API (wrapped in a `QueryClientProvider`).

Unit + integration both run under one command:

```sh
npm run test          # vitest run — all *.test.ts(x) under src/
```

Current count: **23 tests across 9 files**, all green.

## Level 3 — E2E (Playwright)

Full-stack, browser-driven, against the **real care-api** and a **production build**
of the console served by `vite preview`. `playwright.config.ts` boots both servers
(via its `webServer` block) before the suite and tears them down after; care-api
persists to `data.json`, so e2e mutations survive a restart.

- `e2e/auth.spec.ts` — operator signs in; carer and relative are rejected with the
  operator-only message.
- `e2e/visits.spec.ts` — operator opens Visits, reassigns a carer, opens a visit detail.
- `e2e/scheduling.spec.ts` — operator schedules a visit with tasks; it lands in Visits.
- `e2e/agent-runs.spec.ts` — admin sees Agent runs, then approves one run and overrides
  another (capturing the override note). Runs are seeded through the ingest endpoint.
- `e2e/helpers.ts` — shared `login` / `loginAsOperator` / `loginAsAdmin` helpers.

```sh
npx playwright install chromium   # one-time browser download (~187 MB)
npx playwright test               # boots care-api + preview, runs e2e
npx playwright test --list        # list specs without running (no browser needed)
```

> **Note:** the Chromium binary must be downloaded once with `playwright install`.
> If your environment can't fetch it (offline / restricted / time-limited), the config
> and specs are still valid — `npx playwright test --list` confirms they load — they
> just need a browser present to execute.

## Philosophy (the QA angle)

- **Test at the boundary, not the implementation.** Unit tests assert rendered output
  and public store behaviour, not internals — refactors don't break them.
- **Mock the network, not your own code.** MSW fakes HTTP at the wire, so the real
  axios + React Query stack is what's under test. Integration tests stay honest.
- **One end-to-end proof per critical flow.** E2E is expensive, so it's reserved for the
  flows that matter (auth gate, scheduling, reassignment, agent supervision) against the
  real backend — the things that must never silently break.
- **Contract-first types.** Types come from `openapi.yaml` via `npm run gen:api`; an API
  change surfaces as a compile error, which is the cheapest test of all.
