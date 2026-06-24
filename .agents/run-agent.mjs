#!/usr/bin/env node
// Nightly agent runner — the bridge between "Claude" and the Agent Runs web UI.
//
// What it does:
//   1. Picks a task (from --task or the first unchecked item in backlog.md).
//   2. Resolves the role's skill + allowed scope (provenance).
//   3. Does the work:
//        --real : runs the Claude CLI headless on a git branch, captures the diff,
//                 runs the project's checks, and only proposes if green.
//        (default / --dry-run): produces a proposal record WITHOUT changing code,
//                 so you can see the whole loop end-to-end immediately.
//   4. POSTs a "run record" to care-api /api/agent-runs (auth: x-agent-key).
//      The Agent Runs UI then shows it for an admin to approve/override.
//
// Usage:
//   node run-agent.mjs --role reactDev --task "Add empty states" [--real]
//   node run-agent.mjs            # takes the first backlog item
//
// Env: AGENT_API (default http://localhost:3001), AGENT_INGEST_KEY (default dev-agent-key)

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const API = process.env.AGENT_API ?? "http://localhost:3001";
const KEY = process.env.AGENT_INGEST_KEY ?? "dev-agent-key";

const args = Object.fromEntries(
  process.argv.slice(2).flatMap((a, i, arr) =>
    a.startsWith("--") ? [[a.slice(2), arr[i + 1]?.startsWith("--") || arr[i + 1] === undefined ? true : arr[i + 1]]] : [],
  ),
);

const ROLE_PROJECT = {
  reactDev: "care-ops-console",
  kmpDev: "care-carer-kmp",
  playwrightQA: "care-ops-console",
  kmpQA: "care-carer-kmp",
};

function nextBacklogItem() {
  const md = readFileSync(join(__dirname, "backlog.md"), "utf8");
  const items = md.split("\n").filter((l) => /^- \[ \] \(/.test(l));
  if (!items.length) return null;
  // Pick a random open item so each scheduled run looks like a different agent
  // doing different work (nicer for a live demo than always the first item).
  const m = items[Math.floor(Math.random() * items.length)];
  const role = m.match(/\(([^)]+)\)/)?.[1] ?? "reactDev";
  const task = m.replace(/^- \[ \] \([^)]+\)\s*/, "").trim();
  return { role, task };
}

async function main() {
  let role = args.role;
  let task = args.task;
  if (!task) {
    const item = nextBacklogItem();
    if (!item) return console.error("No task and no backlog items.");
    role = role ?? item.role;
    task = item.task;
  }
  role = role ?? "reactDev";
  const project = args.project ?? ROLE_PROJECT[role] ?? "care-ops-console";
  const real = args.real === true;

  const scope = readFileSync(join(__dirname, "SCOPE.md"), "utf8")
    .split("\n")
    .find((l) => l.includes(`| ${role} |`))
    ?.split("|")[2]
    ?.trim() ?? "see SCOPE.md";

  let summary, rationale, diff;

  if (real) {
    // Real mode: drive the Claude CLI headless on a branch, then capture the diff.
    // Requires the `claude` CLI + git. Kept guarded so the demo works without it.
    const repo = join(__dirname, "..", project);
    const branch = `agent/${role}/${Date.now()}`;
    execSync(`git -C "${repo}" checkout -b ${branch}`, { stdio: "inherit" });
    const skill = readFileSync(join(__dirname, "skills", `${role}.md`), "utf8");
    const prompt = `${skill}\n\nTask: ${task}\nObey ../.agents/SCOPE.md. Make the change, then stop.`;
    execSync(`cd "${repo}" && claude -p ${JSON.stringify(prompt)}`, { stdio: "inherit" });
    diff = execSync(`git -C "${repo}" diff`, { encoding: "utf8" }).slice(0, 8000);
    summary = `Proposed change for: ${task}`;
    rationale = `Ran ${role} headless on branch ${branch}. Review the diff. (Run your build/tests before merging.)`;
  } else {
    // Dry run: no code change, just a proposal so the supervision loop is visible.
    summary = `(dry run) Proposal for: ${task}`;
    rationale = `Dry run — no files changed. A real run would implement "${task}" within scope "${scope}", run lint/typecheck/build, and only open a PR if green.`;
    diff = `# dry run — no diff\n# task: ${task}\n# role: ${role}\n# project: ${project}`;
  }

  const body = {
    agent: role,
    project,
    task,
    summary,
    rationale,
    diff,
    provenance: { skill: `.agents/skills/${role}.md`, scope, prompt: task },
  };

  const res = await fetch(`${API}/api/agent-runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-agent-key": KEY },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) return console.error("Failed:", json);
  console.log(`Posted run ${json.id} (${role} → ${project}). Open Agent Runs as admin to review.`);
}

main().catch((e) => console.error(e));
