// Tiny JSON-file persistence for the otherwise in-memory care-api.
// No new deps — just node fs. Only the MUTABLE data is persisted; the static
// catalog (carers/clients/visits base, users) stays seeded in code and we apply
// the persisted overlay on top at boot.
//
// Persisted:
//   - messages   (full array — chat is small)
//   - agentRuns  (full array — includes the nightly runner's submissions)
//   - per-visit mutations: carer (re)assignment, status, check-in/out, report,
//     and each task's done flag
//   - visits created at runtime via POST /api/visits
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { visits, messages, agentRuns, type Visit, type Message, type AgentRun } from "./data.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
// In the cloud we point DATA_DIR at a persistent volume (e.g. /data on Railway);
// locally it falls back to the repo folder.
const DATA_FILE = process.env.DATA_FILE ?? join(process.env.DATA_DIR ?? join(__dirname, ".."), "data.json");

interface VisitPatch {
  carerId?: string;
  carerName?: string;
  status?: Visit["status"];
  checkInAt?: string;
  checkOutAt?: string;
  report?: string;
  tasksDone?: Record<string, boolean>; // taskId -> done
}

interface PersistShape {
  messages: Message[];
  agentRuns: AgentRun[];
  visitPatches: Record<string, VisitPatch>; // seed visits only
  createdVisits: Visit[]; // visits added at runtime
}

// Baselines captured from the fresh seed, so save() knows what counts as a change.
const seedVisitIds = new Set(visits.map((v) => v.id));
const seedCarerId = new Map(visits.map((v) => [v.id, v.carerId]));
const seedStatus = new Map(visits.map((v) => [v.id, v.status]));

let ready = false; // ignore writes until the initial load completes

// Build the on-disk snapshot from the current in-memory state.
function snapshot(): PersistShape {
  const visitPatches: Record<string, VisitPatch> = {};
  const createdVisits: Visit[] = [];

  for (const v of visits) {
    if (!seedVisitIds.has(v.id)) {
      createdVisits.push(v); // runtime-created visit — store it whole
      continue;
    }
    const tasksDone: Record<string, boolean> = {};
    for (const t of v.tasks) if (t.done) tasksDone[t.id] = true;

    const patch: VisitPatch = {};
    if (v.carerId !== seedCarerId.get(v.id)) {
      patch.carerId = v.carerId;
      patch.carerName = v.carerName;
    }
    if (v.status !== seedStatus.get(v.id)) patch.status = v.status;
    if (v.checkInAt) patch.checkInAt = v.checkInAt;
    if (v.checkOutAt) patch.checkOutAt = v.checkOutAt;
    if (v.report) patch.report = v.report;
    if (Object.keys(tasksDone).length) patch.tasksDone = tasksDone;

    if (Object.keys(patch).length) visitPatches[v.id] = patch;
  }

  return { messages, agentRuns, visitPatches, createdVisits };
}

// Apply a persisted snapshot back onto the seeded in-memory state.
function apply(data: PersistShape): void {
  if (Array.isArray(data.messages)) {
    messages.splice(0, messages.length, ...data.messages);
  }
  if (Array.isArray(data.agentRuns)) {
    agentRuns.splice(0, agentRuns.length, ...data.agentRuns);
  }
  if (Array.isArray(data.createdVisits)) {
    // newest first, mirroring POST /api/visits which unshifts
    for (const v of data.createdVisits) visits.unshift(v);
  }
  for (const [id, patch] of Object.entries(data.visitPatches ?? {})) {
    const v = visits.find((x) => x.id === id);
    if (!v) continue;
    if (patch.carerId) v.carerId = patch.carerId;
    if (patch.carerName) v.carerName = patch.carerName;
    if (patch.status) v.status = patch.status;
    if (patch.checkInAt) v.checkInAt = patch.checkInAt;
    if (patch.checkOutAt) v.checkOutAt = patch.checkOutAt;
    if (typeof patch.report === "string") v.report = patch.report;
    if (patch.tasksDone) {
      for (const t of v.tasks) if (patch.tasksDone[t.id]) t.done = true;
    }
  }
}

// Load on boot. If no file exists, seed it from the current (today's) state.
export function load(): void {
  try {
    if (existsSync(DATA_FILE)) {
      const raw = readFileSync(DATA_FILE, "utf8");
      apply(JSON.parse(raw) as PersistShape);
      console.log(`care-api: loaded persisted data from ${DATA_FILE}`);
    } else {
      ready = true;
      save();
      console.log(`care-api: seeded fresh data file at ${DATA_FILE}`);
      return;
    }
  } catch (err) {
    console.warn("care-api: failed to load data.json, starting fresh:", err);
  }
  ready = true;
}

// Persist the current mutable state. Called after every write.
export function save(): void {
  if (!ready) return;
  try {
    writeFileSync(DATA_FILE, JSON.stringify(snapshot(), null, 2), "utf8");
  } catch (err) {
    console.warn("care-api: failed to save data.json:", err);
  }
}
