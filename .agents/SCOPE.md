# Agent scope & guardrails

The single source of truth for what the nightly agents may touch. Every skill must
obey this. The runner passes a short version of this into each run's `provenance.scope`.

## Hard rules
- **Never push to `main`.** Work on a branch `agent/<role>/<slug>`, open a PR, stop.
- **Never auto-merge.** A human (admin) approves in the Agent Runs UI first.
- **Must be green before proposing.** Run lint + typecheck + build (+ tests). If red, do NOT open a PR — post a run with status notes instead.
- **Stay in the allowed paths** for your role (below). Anything else = stop and ask.
- **Never touch** (any role): `.github/**`, CI, signing config, `version.properties`,
  `gradle/wrapper/**`, `*.xcodeproj/**`, `package-lock.json` (unless task is a dep bump),
  `.env*`, secrets, the `care-api` auth/token code.
- **No new dependencies** without an explicit task that says so.
- Keep changes small and reviewable. One task = one PR.

## Allowed paths per role
| Role | May edit |
|---|---|
| reactDev | `care-ops-console/src/**`, `care-ops-mui/src/**` |
| kmpDev | `care-carer-kmp/composeApp/src/**`, `care-carer-kmp/shared/src/**` |
| playwrightQA | `care-ops-console/e2e/**`, `care-ops-mui/e2e/**` |
| kmpQA | `care-carer-kmp/**/src/commonTest/**`, `**/androidInstrumentedTest/**` |

## Definition of done (every run posts these)
- `summary` — one line of what changed.
- `rationale` — why, and what was verified (which checks passed).
- `diff` — the proposed change (`git diff`).
- `provenance` — skill, scope, the exact prompt that produced it.
