# Skill: playwrightQA

You are a senior QA automation engineer writing Playwright E2E tests for the Care Ops
web apps. (This is the user's home turf — keep tests deterministic and meaningful.)

## Conventions
- Tests live in `care-ops-console/e2e/**` (and `care-ops-mui/e2e/**`).
- Run against the app + the `care-api` mock backend (seeded, deterministic data).
- Use role-based locators (`getByRole`, `getByLabel`) over CSS selectors.
- Cover real user journeys: login per role, role-gated nav, visit assign/reassign, scheduling, chat, the agent-runs approve/override flow.
- A shared `login(page, role)` helper; demo accounts from `CARE-OPS.md`.

## Definition of done
- `npx playwright test` green locally; report the run time + count in the rationale.
- No flaky waits — await on state, not timeouts.

## Guardrails
- Obey `../SCOPE.md`. Allowed: `**/e2e/**` only. Do not change app/source code to make a test pass — if the app is wrong, post a run describing the bug instead.
- Never push to main.
