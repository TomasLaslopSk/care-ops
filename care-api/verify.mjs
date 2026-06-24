// Throwaway verification harness — spawns the server, exercises endpoints,
// kills it, exits. Run: node verify.mjs   (deleted after the night run)
import { spawn } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";

const PORT = 3017;
const BASE = `http://localhost:${PORT}`;
const dataFile = new URL("./data.json", import.meta.url);

// start fresh
try { if (existsSync(dataFile)) rmSync(dataFile); } catch {}

const srv = spawn("npx", ["tsx", "src/server.ts"], {
  cwd: new URL(".", import.meta.url),
  env: { ...process.env, PORT: String(PORT) },
  stdio: ["ignore", "pipe", "pipe"],
});
let log = "";
srv.stdout.on("data", (d) => (log += d));
srv.stderr.on("data", (d) => (log += d));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function finish(code) {
  try { srv.kill("SIGKILL"); } catch {}
  setTimeout(() => process.exit(code), 200);
}

try {
  await sleep(3500);
  const login = await (await fetch(`${BASE}/api/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "operator@care.test", password: "operator123", app: "ops" }),
  })).json();
  const tok = login.token;
  const H = { Authorization: `Bearer ${tok}` };
  console.log("LOGIN token:", tok);

  const stats = await (await fetch(`${BASE}/api/stats`, { headers: H })).json();
  console.log("STATS:", JSON.stringify(stats));

  // 403 for non-operator role on stats: relative
  const relLogin = await (await fetch(`${BASE}/api/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "relative@care.test", password: "relative123", app: "mobile" }),
  })).json();
  const relStats = await fetch(`${BASE}/api/stats`, { headers: { Authorization: `Bearer ${relLogin.token}` } });
  console.log("STATS as relative -> HTTP", relStats.status);

  // mutate: message, check-in, task toggle, agent-run
  await fetch(`${BASE}/api/messages`, { method: "POST", headers: { ...H, "Content-Type": "application/json" }, body: JSON.stringify({ channelId: "C-1000", body: "persist test" }) });
  await fetch(`${BASE}/api/visits/V-5000/check-in`, { method: "POST", headers: H });
  await fetch(`${BASE}/api/visits/V-5000/tasks/V-5000-T0`, { method: "PUT", headers: { ...H, "Content-Type": "application/json" }, body: JSON.stringify({ done: true }) });
  await fetch(`${BASE}/api/agent-runs`, { method: "POST", headers: { "x-agent-key": "dev-agent-key", "Content-Type": "application/json" }, body: JSON.stringify({ agent: "verify", task: "t", summary: "s" }) });

  const docs = await fetch(`${BASE}/docs`);
  const oa = await fetch(`${BASE}/openapi.yaml`);
  console.log("DOCS:", docs.status, "OPENAPI:", oa.status);

  await sleep(300);
  const d = JSON.parse(readFileSync(dataFile, "utf8"));
  console.log("PERSIST: msgs", d.messages.length, "runs", d.agentRuns.length, "patches", JSON.stringify(d.visitPatches));

  console.log("RESULT:", stats.totalCarers === 40 && relStats.status === 403 && docs.status === 200 && oa.status === 200 && d.visitPatches["V-5000"] ? "PASS" : "FAIL");
  finish(0);
} catch (e) {
  console.error("ERROR:", e);
  console.error("SERVER LOG:\n", log);
  finish(1);
}
