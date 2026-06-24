import express from "express";
import cors from "cors";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";
import {
  carers,
  clients,
  visits,
  messages,
  users,
  agentRuns,
  nextMessageId,
  nextVisitId,
  nextAgentRunId,
  nextCarerId,
  nextClientId,
  nextUserId,
  type Message,
  type Visit,
  type VisitTask,
  type AgentRun,
  type Carer,
  type Client,
  type User,
  type Role,
} from "./data.ts";

// Shared secret the nightly runner uses to submit runs (header: x-agent-key).
const AGENT_INGEST_KEY = process.env.AGENT_INGEST_KEY ?? "dev-agent-key";
import {
  requireAuth,
  tokenFor,
  ownChannel,
  canSeeChannel,
  type AuthedRequest,
} from "./auth.ts";
import { addClient, send, broadcastMessage, broadcastAlert } from "./sse.ts";
import { load, save } from "./store.ts";

const app = express();
app.use(cors());
app.use(express.json());

// Ops-level access = operators AND admins. Admin is a superset of operator:
// it can do everything an operator can, plus the agent-supervision screens.
const isOps = (u: AuthedRequest["user"]) =>
  !!u && (u.role === "operator" || u.role === "admin");

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Public: health + contract ---
app.get("/api/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.get("/openapi.yaml", (_req, res) => {
  res.type("text/yaml").sendFile(join(__dirname, "..", "openapi.yaml"));
});

// Swagger UI for our OpenAPI contract — open http://localhost:3001/docs
app.get("/docs", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Care API — Swagger</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="app"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => SwaggerUIBundle({ url: "/openapi.yaml", dom_id: "#app" });
    </script>
  </body>
</html>`);
});

// --- Public: login (email + password) ---
// `app` gates which front-end a role may sign into:
//   app="ops"    -> CareOps web: operators only
//   app="mobile" -> carer app:   carers + relatives only
app.post("/api/auth/login", (req, res) => {
  const { email = "", password = "", app = "" } = req.body ?? {};
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: "invalid credentials" });

  if (app === "ops" && user.role !== "operator" && user.role !== "admin") {
    return res.status(403).json({ error: "CareOps is for operators only" });
  }
  if (app === "mobile" && user.role === "operator") {
    return res.status(403).json({ error: "The carer app is for carers and relatives only" });
  }

  const { password: _pw, ...safe } = user;
  res.json({ token: tokenFor(user), user: safe });
});

// --- Everything below requires a valid token ---
app.get("/api/auth/me", requireAuth, (req: AuthedRequest, res) => {
  const { password: _pw, ...safe } = req.user!;
  res.json(safe);
});

// Carers: filter by region/status (operator-style listing).
app.get("/api/carers", requireAuth, (req, res) => {
  const region = String(req.query.region ?? "");
  const status = String(req.query.status ?? "");
  let result = carers;
  if (region) result = result.filter((c) => c.region === region);
  if (status) result = result.filter((c) => c.status === status);
  res.json({ data: result, total: result.length });
});

// Create a carer (operator/admin only).
app.post("/api/carers", requireAuth, (req: AuthedRequest, res) => {
  if (!isOps(req.user)) return res.status(403).json({ error: "operator only" });
  const { name, region, status } = req.body ?? {};
  if (!name || !String(name).trim()) return res.status(400).json({ error: "name is required" });
  if (!region || !String(region).trim()) return res.status(400).json({ error: "region is required" });
  const allowedStatus = ["active", "inactive", "onboarding"];
  const carer: Carer = {
    id: nextCarerId(),
    name: String(name).trim(),
    region: String(region),
    status: (allowedStatus.includes(status) ? status : "onboarding") as Carer["status"],
    visitsThisWeek: 0,
  };
  carers.unshift(carer); // newest first
  save();
  res.status(201).json(carer);
});

// Dashboard stats (operator/admin only). Computed from the current data.
app.get("/api/stats", requireAuth, (req: AuthedRequest, res) => {
  if (req.user!.role !== "operator" && req.user!.role !== "admin") {
    return res.status(403).json({ error: "operator only" });
  }
  const today = new Date().toDateString();
  const todaysVisits = visits.filter((v) => new Date(v.scheduledAt).toDateString() === today).length;
  const activeCarers = carers.filter((c) => c.status === "active").length;
  res.json({
    todaysVisits,
    activeCarers,
    totalCarers: carers.length,
    openAlerts: 0,
  });
});

// Visits: scoped by role. carer -> own; relative -> their carer; operator -> all.
app.get("/api/visits", requireAuth, (req: AuthedRequest, res) => {
  const user = req.user!;
  const status = String(req.query.status ?? "");
  const limit = Number(req.query.limit ?? 0);

  let result = visits;
  if (user.role === "carer") result = result.filter((v) => v.carerId === user.carerId);
  else if (user.role === "relative") result = result.filter((v) => v.clientId === user.relatedClientId);
  // operator: all

  if (status) result = result.filter((v) => v.status === status);
  if (limit > 0) result = result.slice(0, limit);
  res.json({ data: result, total: result.length });
});

// Create a visit (operator only). Carers/relatives cannot create visits.
app.post("/api/visits", requireAuth, (req: AuthedRequest, res) => {
  if (!isOps(req.user)) return res.status(403).json({ error: "operator only" });
  const { clientId, carerId, scheduledAt, durationMin, tasks } = req.body ?? {};
  const client = clients.find((c) => c.id === clientId);
  const carer = carers.find((c) => c.id === carerId);
  if (!client) return res.status(400).json({ error: "unknown clientId" });
  if (!carer) return res.status(400).json({ error: "unknown carerId" });

  const id = nextVisitId();
  const taskLabels: string[] = Array.isArray(tasks) ? tasks.filter((t: unknown) => typeof t === "string" && t.trim()) : [];
  const visit: Visit = {
    id,
    clientId: client.id,
    client: client.name,
    clientLat: client.lat,
    clientLng: client.lng,
    clientAddress: client.address,
    tasks: taskLabels.map((label, t): VisitTask => ({ id: `${id}-T${t}`, label, done: false })),
    carerId: carer.id,
    carerName: carer.name,
    region: carer.region,
    scheduledAt: scheduledAt || new Date().toISOString(),
    durationMin: Number(durationMin) || 30,
    status: "scheduled",
  };
  visits.unshift(visit); // newest first
  save();
  res.status(201).json(visit);
});

// Clients (operator only) — the people receiving care.
app.get("/api/clients", requireAuth, (req: AuthedRequest, res) => {
  if (!isOps(req.user)) return res.status(403).json({ error: "operator only" });
  res.json({ data: clients, total: clients.length });
});

// Create a client (operator/admin only). lat/lng default to central London if omitted.
app.post("/api/clients", requireAuth, (req: AuthedRequest, res) => {
  if (!isOps(req.user)) return res.status(403).json({ error: "operator only" });
  const { name, region, address, lat, lng } = req.body ?? {};
  if (!name || !String(name).trim()) return res.status(400).json({ error: "name is required" });
  if (!region || !String(region).trim()) return res.status(400).json({ error: "region is required" });
  const client: Client = {
    id: nextClientId(),
    name: String(name).trim(),
    region: String(region),
    lat: typeof lat === "number" ? lat : 51.5074,
    lng: typeof lng === "number" ? lng : -0.1278,
    address: address ? String(address).trim() : "—",
  };
  clients.unshift(client); // newest first
  save();
  res.status(201).json(client);
});

// A single visit, scoped by role (carer own / relative own client / operator any).
app.get("/api/visits/:id", requireAuth, (req: AuthedRequest, res) => {
  const v = visits.find((x) => x.id === req.params.id);
  if (!v) return res.status(404).json({ error: "visit not found" });
  const u = req.user!;
  const allowed =
    isOps(u) ||
    (u.role === "carer" && v.carerId === u.carerId) ||
    (u.role === "relative" && v.clientId === u.relatedClientId);
  if (!allowed) return res.status(403).json({ error: "forbidden" });
  res.json(v);
});

// Only the assigned carer (or an operator) may check in / out / write the report.
function canActOnVisit(u: AuthedRequest["user"], v: (typeof visits)[number]): boolean {
  if (!u) return false;
  return isOps(u) || (u.role === "carer" && v.carerId === u.carerId);
}

app.post("/api/visits/:id/check-in", requireAuth, (req: AuthedRequest, res) => {
  const v = visits.find((x) => x.id === req.params.id);
  if (!v) return res.status(404).json({ error: "visit not found" });
  if (!canActOnVisit(req.user, v)) return res.status(403).json({ error: "forbidden" });
  // Geofence is intentionally NOT enforced for now (client coords/address are still
  // stored + shown). To switch it on later, compare the carer's lat/lng to the client.
  v.checkInAt = new Date().toISOString();
  v.status = "in_progress";
  save();
  res.json(v);
});

// Toggle a task's done state (assigned carer or operator).
app.put("/api/visits/:id/tasks/:taskId", requireAuth, (req: AuthedRequest, res) => {
  const v = visits.find((x) => x.id === req.params.id);
  if (!v) return res.status(404).json({ error: "visit not found" });
  if (!canActOnVisit(req.user, v)) return res.status(403).json({ error: "forbidden" });
  const task = v.tasks.find((t) => t.id === req.params.taskId);
  if (!task) return res.status(404).json({ error: "task not found" });
  task.done = Boolean(req.body?.done);
  save();
  res.json(v);
});

app.post("/api/visits/:id/check-out", requireAuth, (req: AuthedRequest, res) => {
  const v = visits.find((x) => x.id === req.params.id);
  if (!v) return res.status(404).json({ error: "visit not found" });
  if (!canActOnVisit(req.user, v)) return res.status(403).json({ error: "forbidden" });
  v.checkOutAt = new Date().toISOString();
  v.status = "completed";
  save();
  res.json(v);
});

app.put("/api/visits/:id/report", requireAuth, (req: AuthedRequest, res) => {
  const v = visits.find((x) => x.id === req.params.id);
  if (!v) return res.status(404).json({ error: "visit not found" });
  if (!canActOnVisit(req.user, v)) return res.status(403).json({ error: "forbidden" });
  v.report = String(req.body?.report ?? "");
  save();
  res.json(v);
});

// Assign / reassign a visit to a carer (operator only).
app.patch("/api/visits/:id", requireAuth, (req: AuthedRequest, res) => {
  if (!isOps(req.user)) return res.status(403).json({ error: "operator only" });
  const visit = visits.find((v) => v.id === req.params.id);
  if (!visit) return res.status(404).json({ error: "visit not found" });

  const { carerId } = req.body ?? {};
  const carer = carers.find((c) => c.id === carerId);
  if (!carer) return res.status(400).json({ error: "unknown carerId" });

  visit.carerId = carer.id;
  visit.carerName = carer.name;
  save();
  res.json(visit);
});

// Channels an operator can open (one per carer). Non-operators just use their own.
app.get("/api/channels", requireAuth, (req: AuthedRequest, res) => {
  const user = req.user!;
  const nameForChannel = (id: string) =>
    carers.find((c) => c.id === id)?.name ?? clients.find((c) => c.id === id)?.name ?? id;
  if (isOps(user)) {
    // Operators (and admins) can open every carer and every client channel.
    const data = [
      ...carers.map((c) => ({ id: c.id, name: `Carer · ${c.name}` })),
      ...clients.map((c) => ({ id: c.id, name: `Client · ${c.name}` })),
    ];
    res.json({ data, total: data.length });
  } else {
    const id = ownChannel(user)!;
    res.json({ data: [{ id, name: nameForChannel(id) }], total: 1 });
  }
});

// Resolve which channel this request targets, honoring role.
function resolveChannel(user: AuthedRequest["user"], requested?: string): string | undefined {
  if (!user) return undefined;
  if (isOps(user)) return requested || carers[0].id;
  return ownChannel(user); // carer/relative: forced to their own channel
}

app.get("/api/messages", requireAuth, (req: AuthedRequest, res) => {
  const channelId = resolveChannel(req.user, String(req.query.channelId ?? ""));
  if (!channelId || !canSeeChannel(req.user!, channelId)) {
    return res.status(403).json({ error: "forbidden channel" });
  }
  const result = messages.filter((m) => m.channelId === channelId);
  res.json({ data: result, total: result.length });
});

app.post("/api/messages", requireAuth, (req: AuthedRequest, res) => {
  const { channelId: requested, body = "" } = req.body ?? {};
  const channelId = resolveChannel(req.user, requested);
  if (!channelId || !canSeeChannel(req.user!, channelId)) {
    return res.status(403).json({ error: "forbidden channel" });
  }
  if (!body.trim()) return res.status(400).json({ error: "body is required" });

  const msg: Message = {
    id: nextMessageId(),
    channelId,
    author: req.user!.name,
    body,
    createdAt: new Date().toISOString(),
  };
  messages.push(msg);
  save();
  broadcastMessage(channelId, msg); // only clients allowed on this channel
  res.status(201).json(msg);
});

// --- Agent supervision (admin only) ---
function requireAdmin(req: AuthedRequest, res: import("express").Response): boolean {
  if (req.user!.role !== "admin") {
    res.status(403).json({ error: "admin only" });
    return false;
  }
  return true;
}

app.get("/api/agent-runs", requireAuth, (req: AuthedRequest, res) => {
  if (!requireAdmin(req, res)) return;
  // newest first
  res.json({ data: [...agentRuns].reverse(), total: agentRuns.length });
});

// Ingest a run from the nightly runner (authenticated by the agent key, not a user).
app.post("/api/agent-runs", (req, res) => {
  if (req.header("x-agent-key") !== AGENT_INGEST_KEY) {
    return res.status(401).json({ error: "bad agent key" });
  }
  const b = req.body ?? {};
  if (!b.agent || !b.task) return res.status(400).json({ error: "agent and task required" });
  const run: AgentRun = {
    id: nextAgentRunId(),
    agent: String(b.agent),
    project: String(b.project ?? ""),
    task: String(b.task),
    summary: String(b.summary ?? ""),
    rationale: String(b.rationale ?? ""),
    diff: String(b.diff ?? ""),
    provenance: {
      skill: String(b.provenance?.skill ?? b.agent),
      scope: String(b.provenance?.scope ?? ""),
      prompt: String(b.provenance?.prompt ?? ""),
    },
    status: "proposed",
    createdAt: new Date().toISOString(),
  };
  agentRuns.push(run);
  save();
  res.status(201).json(run);
});

app.post("/api/agent-runs/:id/decision", requireAuth, (req: AuthedRequest, res) => {
  if (!requireAdmin(req, res)) return;
  const run = agentRuns.find((r) => r.id === req.params.id);
  if (!run) return res.status(404).json({ error: "run not found" });
  const { decision, note } = req.body ?? {};
  if (decision !== "approved" && decision !== "overridden") {
    return res.status(400).json({ error: "decision must be approved|overridden" });
  }
  run.status = decision;
  run.decidedAt = new Date().toISOString();
  run.decisionNote = typeof note === "string" ? note : "";
  save();
  res.json(run);
});

// --- User administration (admin only) ---
// List staff accounts (operators + admins + carers/relatives), never exposing passwords.
app.get("/api/users", requireAuth, (req: AuthedRequest, res) => {
  if (!requireAdmin(req, res)) return;
  const data = users.map(({ password: _pw, ...safe }) => safe);
  res.json({ data, total: data.length });
});

// Create an operator or admin (admin only). Passwords are stored plaintext here
// for the learning demo only — never do this in production.
app.post("/api/users", requireAuth, (req: AuthedRequest, res) => {
  if (!requireAdmin(req, res)) return;
  const { name, email, password, role } = req.body ?? {};
  if (!name || !String(name).trim()) return res.status(400).json({ error: "name is required" });
  if (!email || !String(email).trim()) return res.status(400).json({ error: "email is required" });
  if (!password || String(password).length < 6) {
    return res.status(400).json({ error: "password must be at least 6 characters" });
  }
  if (role !== "operator" && role !== "admin") {
    return res.status(400).json({ error: "role must be operator or admin" });
  }
  if (users.some((u) => u.email.toLowerCase() === String(email).trim().toLowerCase())) {
    return res.status(409).json({ error: "a user with this email already exists" });
  }
  const user: User = {
    id: nextUserId(),
    name: String(name).trim(),
    email: String(email).trim(),
    password: String(password),
    role: role as Role,
  };
  users.push(user);
  save();
  const { password: _pw, ...safe } = user;
  res.status(201).json(safe);
});

// --- SSE: token comes via ?token= (EventSource can't set headers) ---
app.get("/api/events", requireAuth, (req: AuthedRequest, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();
  addClient(res, req.user);
  send(res, "hello", { ts: Date.now() });
});

// One global alert ticker (not per-connection) -> broadcast to all clients.
setInterval(() => {
  const v = visits[Math.floor(Math.random() * visits.length)];
  const level = ["info", "warning", "critical"][Math.floor(Math.random() * 3)];
  const kind = ["delay", "status change", "check-in"][Math.floor(Math.random() * 3)];
  broadcastAlert({
    id: `A-${Date.now()}`,
    level,
    message: `Visit ${v.id} (${v.client}) — ${kind}`,
    visitId: v.id,
    ts: Date.now(),
  });
}, 6000);

// --- Serve the built frontend (single-service production deploy) ---
// In production we build care-ops-console and point FRONTEND_DIST at its dist folder;
// care-api then serves the SPA + the API from one origin (no CORS, one URL).
const FRONTEND_DIST = process.env.FRONTEND_DIST;
if (FRONTEND_DIST && existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  // SPA fallback: any non-API GET returns index.html so client routes work on refresh.
  app.get(/^\/(?!api\/|docs|openapi\.yaml).*/, (_req, res) => {
    res.sendFile(join(FRONTEND_DIST, "index.html"));
  });
}

// Load any persisted mutable data (chat, agent runs, visit mutations) before serving.
load();

const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, () => console.log(`care-api listening on http://localhost:${PORT}`));
