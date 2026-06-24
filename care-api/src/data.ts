// Domain types + in-memory seed. Reset on every server restart (no DB).
// Kept intentionally close to Cera/Nourish-style care data: carers, visits, chat.

export type CarerStatus = "active" | "inactive" | "onboarding";
export type VisitStatus = "scheduled" | "in_progress" | "completed" | "missed";

export interface Carer {
  id: string;
  name: string;
  region: string;
  status: CarerStatus;
  visitsThisWeek: number;
}

export interface Client {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  address: string;
}

export interface VisitTask {
  id: string;
  label: string;
  done: boolean;
}

export interface Visit {
  id: string;
  clientId: string;
  client: string; // denormalized client name for display
  clientLat: number; // geofence target (client's location)
  clientLng: number;
  clientAddress: string;
  carerId: string;
  carerName: string;
  region: string;
  scheduledAt: string; // ISO
  durationMin: number;
  status: VisitStatus;
  tasks: VisitTask[];
  checkInAt?: string; // ISO — set when the carer checks in
  checkOutAt?: string; // ISO — set when the carer checks out
  report?: string; // visit report written by the carer
}

// Geofence tolerance for check-in (metres). Mirrors cera-android's configurable
// geolocationCheckInDistance.
export const GEOFENCE_METERS = 100;

// Default care tasks seeded onto existing visits (operators set custom ones on create).
export const DEFAULT_TASKS = ["Medication", "Personal care", "Meal preparation"];

// Haversine distance in metres between two lat/lng points.
export function distanceMeters(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export interface Message {
  id: string;
  channelId: string; // a carer's channel == that carer's id (e.g. "C-1000")
  author: string;
  body: string;
  createdAt: string; // ISO
}

export type Role = "carer" | "operator" | "relative" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // seeded plaintext — LEARNING ONLY, never do this in production
  role: Role;
  carerId?: string; // role=carer    -> which carer they are
  relatedClientId?: string; // role=relative -> which client they follow
}

export const REGIONS = ["North", "South", "East", "West", "Central"] as const;

const FIRST = ["Amara", "Ben", "Chloe", "Dani", "Ewan", "Farah", "Greg", "Hana", "Iris", "Jon"];
const LAST = ["Okoro", "Smith", "Doyle", "Patel", "Murray", "Khan", "Walsh", "Nagy", "Reed", "Cole"];
const CARER_STATUS: CarerStatus[] = ["active", "active", "active", "inactive", "onboarding"];
const VISIT_STATUS: VisitStatus[] = ["scheduled", "in_progress", "completed", "missed"];

// 40 carers — identical dataset across both frontends.
export const carers: Carer[] = Array.from({ length: 40 }, (_, i) => ({
  id: `C-${1000 + i}`,
  name: `${FIRST[i % FIRST.length]} ${LAST[(i * 3) % LAST.length]}`,
  region: REGIONS[i % REGIONS.length],
  status: CARER_STATUS[i % CARER_STATUS.length],
  visitsThisWeek: (i * 7) % 23,
}));

const CLIENT_FIRST = ["Mabel", "Arthur", "Edith", "Stanley", "Joan", "Albert", "Doris", "Frank", "Vera", "Harold", "Nora", "Cyril"];
// 12 clients — the people receiving care. Relatives are linked to a client.
export const clients: Client[] = Array.from({ length: 12 }, (_, i) => ({
  id: `CL-${2000 + i}`,
  name: `${CLIENT_FIRST[i % CLIENT_FIRST.length]} ${LAST[(i * 5) % LAST.length]}`,
  region: REGIONS[i % REGIONS.length],
  // Coordinates spread around central London, ~hundreds of metres apart.
  lat: 51.5074 + i * 0.004,
  lng: -0.1278 + i * 0.004,
  address: `${i + 3} Maple Street, London`,
}));

// 600 visits — each has an assigned carer AND a client.
export const visits: Visit[] = Array.from({ length: 600 }, (_, i) => {
  const carer = carers[i % carers.length];
  const client = clients[i % clients.length];
  const start = new Date(Date.now() + (i - 100) * 37 * 60000);
  const id = `V-${5000 + i}`;
  return {
    id,
    clientId: client.id,
    client: client.name,
    clientLat: client.lat,
    clientLng: client.lng,
    clientAddress: client.address,
    tasks: DEFAULT_TASKS.map((label, t) => ({ id: `${id}-T${t}`, label, done: false })),
    carerId: carer.id,
    carerName: carer.name,
    region: carer.region,
    scheduledAt: start.toISOString(),
    durationMin: [30, 45, 60][i % 3],
    status: VISIT_STATUS[i % VISIT_STATUS.length],
  };
});

// Seeded accounts (email + password). One per role; carers/relative link to carers.
export const users: User[] = [
  { id: "U-OP1", name: "Olivia Operator", email: "operator@care.test", password: "operator123", role: "operator" },
  { id: "U-C1", name: "Amara Okoro", email: "amara@care.test", password: "carer123", role: "carer", carerId: "C-1000" },
  { id: "U-C2", name: "Farah Khan", email: "farah@care.test", password: "carer123", role: "carer", carerId: "C-1005" },
  { id: "U-R1", name: "Riley Relative", email: "relative@care.test", password: "relative123", role: "relative", relatedClientId: "CL-2000" },
  { id: "U-AD1", name: "Adele Admin", email: "admin@care.test", password: "admin123", role: "admin" },
];

// --- AI agent supervision (the JD's "agent-supervision surface") ---
// Records of what the nightly dev agents proposed. An admin reviews each: the diff,
// the agent's rationale, and where it came from (provenance), then approves/overrides.
export type AgentRunStatus = "proposed" | "approved" | "overridden";

export interface AgentRun {
  id: string;
  agent: string; // which skill/role produced it, e.g. "reactDev"
  project: string; // target repo, e.g. "care-ops-console"
  task: string;
  summary: string;
  rationale: string; // the agent's reasoning
  diff: string; // proposed change (unified diff text)
  provenance: { skill: string; scope: string; prompt: string };
  status: AgentRunStatus;
  createdAt: string;
  decidedAt?: string;
  decisionNote?: string; // captured when an admin overrides/approves
}

export const agentRuns: AgentRun[] = [
  {
    id: "RUN-1001",
    agent: "reactDev",
    project: "care-ops-console",
    task: "Add empty-state illustration to Visits table",
    summary: "Renders a friendly empty state when there are no visits.",
    rationale:
      "Visits table showed a bare area when the list was empty. Added an EmptyState following the design tokens; no API change needed. Tests + ktlint/tsc pass.",
    diff:
      "--- a/src/routes/Visits.tsx\n+++ b/src/routes/Visits.tsx\n@@\n-      {visits.length === 0 ? null : (\n+      {visits.length === 0 ? (\n+        <EmptyState title=\"No visits\" hint=\"Schedule one to get started.\" />\n+      ) : (",
    provenance: {
      skill: "reactDev",
      scope: "care-ops-console/src/** (no CI, no deps)",
      prompt: "Improve empty/loading states across list screens.",
    },
    status: "proposed",
    createdAt: new Date(Date.now() - 7 * 3600_000).toISOString(),
  },
  {
    id: "RUN-1002",
    agent: "kmpDev",
    project: "care-carer-kmp",
    task: "Show client address on the visit list rows",
    summary: "Adds the client address line under each visit in the carer app.",
    rationale:
      "Carers asked to see the address without opening the detail. Added one Text line; reused formatDateTime; no new deps. Compiles, smoke nav unchanged.",
    diff:
      "--- a/composeApp/.../VisitsScreen.kt\n+++ b/composeApp/.../VisitsScreen.kt\n@@\n             Text(v.client, ...)\n+            Text(v.clientAddress, style = MaterialTheme.typography.bodySmall)",
    provenance: {
      skill: "kmpDev",
      scope: "care-carer-kmp/composeApp/src/** (no Gradle/signing)",
      prompt: "Surface key visit info on the list to reduce taps.",
    },
    status: "proposed",
    createdAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
  },
  {
    id: "RUN-1003",
    agent: "playwrightQA",
    project: "care-ops-console",
    task: "E2E: operator can reassign a visit",
    summary: "New Playwright spec covering login → Visits → reassign carer.",
    rationale:
      "No coverage for reassignment. Added a deterministic spec against the mock backend. Green locally in 3.2s.",
    diff:
      "--- /dev/null\n+++ b/e2e/reassign.spec.ts\n@@\n+test('operator reassigns a visit', async ({ page }) => {\n+  await login(page, 'operator');\n+  await page.goto('/visits');\n+  await page.getByRole('combobox').first().selectOption({ label: 'Ben Patel' });\n+});",
    provenance: {
      skill: "playwrightQA",
      scope: "care-ops-console/e2e/** only",
      prompt: "Add E2E coverage for operator visit management.",
    },
    status: "proposed",
    createdAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
  },
];

// Chat: each carer has a channel == their carer id. The carer and their relative
// share it; operators can read any channel. Used by the real-time SSE demo.
export const messages: Message[] = [
  {
    id: "M-1",
    channelId: "C-1000",
    author: "Olivia Operator",
    body: "Morning handover done. Two visits flagged for follow-up.",
    createdAt: new Date(Date.now() - 9 * 60000).toISOString(),
  },
  {
    id: "M-2",
    channelId: "C-1000",
    author: "Amara Okoro",
    body: "Running 10 min late to V-5102, traffic on the ring road.",
    createdAt: new Date(Date.now() - 4 * 60000).toISOString(),
  },
  {
    id: "M-3",
    channelId: "C-1005",
    author: "Farah Khan",
    body: "Visit V-5105 completed, client is well.",
    createdAt: new Date(Date.now() - 6 * 60000).toISOString(),
  },
];

let messageSeq = messages.length;
export const nextMessageId = () => `M-${++messageSeq}`;

let visitSeq = 5000 + visits.length;
export const nextVisitId = () => `V-${visitSeq++}`;

let runSeq = 1003;
export const nextAgentRunId = () => `RUN-${++runSeq}`;

let carerSeq = 1000 + carers.length;
export const nextCarerId = () => `C-${carerSeq++}`;

let clientSeq = 2000 + clients.length;
export const nextClientId = () => `CL-${clientSeq++}`;

let userSeq = 1000 + users.length;
export const nextUserId = () => `U-${userSeq++}`;
