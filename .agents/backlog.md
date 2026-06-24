# Agent backlog

The nightly runner picks the first unchecked item, runs the matching role, opens a PR,
and posts a run to the Agent Runs UI for an admin to approve/override.

Format: `- [ ] (role) task description`

- [ ] (reactDev) Add empty/loading/error states to the Carers and Clients tables
- [ ] (reactDev) Extract the visit status -> tone mapping into one shared helper used by both web apps
- [ ] (kmpDev) Show the client address on each visit row in the carer app list
- [ ] (playwrightQA) E2E: operator schedules a visit with tasks, then sees it in the list
- [ ] (playwrightQA) E2E: admin approves and overrides an agent run
- [ ] (kmpQA) Unit-test the visit-detail check-in -> report -> check-out gating logic
