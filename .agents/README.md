# .agents — nightly AI dev agents + supervision

This is the "AI-native" piece: overnight agents propose changes to the Care Ops apps,
and an **admin** reviews each proposal in the web app's **Agent Runs** screen
(approve / override with a captured rationale). It demonstrates the JD's
"agent-supervision surfaces — provenance, override, capture rationale".

## How the web "connects to Claude" (the key idea)
There is **no magic link**. The connection is plain HTTP through the backend:

```
 nightly schedule ──> run-agent.mjs ──(runs a Claude agent on a branch)──> git PR
        │                   │
        │                   └── POST /api/agent-runs  (a "run record": prompt, diff, rationale, provenance)
        ▼                                    │
   (cron / launchd)                          ▼
                                        care-api  ──GET /api/agent-runs──>  CareOps web (admin)
                                             ▲                                   │
                                             └────POST decision (approve/override)┘
```

- The agent **writes** what it did (incl. the exact prompt) into a run record.
- The web only **reads** those records — that's how it "knows what prompts ran".
- The admin's decision is written back; a later run can act on it (e.g. merge the PR).
- The agent must be able to reach `care-api`. Locally that means running the schedule
  **on your Mac** so it can hit `http://localhost:3001`.

## Try the loop now (no LLM needed)
```sh
# 1) backend running:  cd care-api && npm run dev
# 2) post a proposal:
node .agents/run-agent.mjs --role reactDev --task "Add empty states to Carers table"
# 3) log into CareOps as admin (admin@care.test / admin123) -> "Agent runs" -> Approve/Override
```
Dry run posts a proposal without touching code, so you see the whole supervision loop.

## Real mode (drives Claude headless)
Needs the Claude CLI (`claude`) + git. Works on a branch, captures the diff, you review:
```sh
node .agents/run-agent.mjs --real            # takes the first backlog item
node .agents/run-agent.mjs --real --role reactDev --task "..."
```

## Schedule it nightly (local, macOS launchd)
Create `~/Library/LaunchAgents/com.tilea.agents.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0"><dict>
  <key>Label</key><string>com.tilea.agents</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/node</string>
    <string>/Users/tomaslaslop/Documents/tilea/.agents/run-agent.mjs</string>
  </array>
  <key>StartCalendarInterval</key><dict><key>Hour</key><integer>2</integer><key>Minute</key><integer>0</integer></dict>
  <key>StandardOutPath</key><string>/tmp/tilea-agents.log</string>
  <key>StandardErrorPath</key><string>/tmp/tilea-agents.err</string>
</dict></plist>
```
```sh
launchctl load ~/Library/LaunchAgents/com.tilea.agents.plist   # runs at 02:00 daily
```
(Or a cron line: `0 2 * * * node /Users/tomaslaslop/Documents/tilea/.agents/run-agent.mjs`.)

> If you later deploy `care-api` to a public URL, a cloud scheduled job could post to it
> instead of running locally.

## Files
- `skills/reactDev.md`, `kmpDev.md`, `playwrightQA.md`, `kmpQA.md` — role definitions.
- `SCOPE.md` — guardrails: allowed paths, never-touch list, branch/PR-only rules.
- `backlog.md` — the task queue.
- `run-agent.mjs` — the runner (dry-run + real).
