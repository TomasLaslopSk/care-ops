import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// --- In-memory data ---
// Carer model + dataset kept identical to the care-ops-mui MSW mock so both
// learning projects render the exact same data.
const FIRST = ["Amara", "Ben", "Chloe", "Dani", "Ewan", "Farah", "Greg", "Hana", "Iris", "Jon"];
const LAST = ["Okoro", "Smith", "Doyle", "Patel", "Murray", "Khan", "Walsh", "Nagy", "Reed", "Cole"];
const REGIONS = ["North", "South", "East", "West", "Central"];
const CARER_STATUS = ["active", "active", "active", "inactive", "onboarding"];
const STATUS = ["scheduled", "in_progress", "completed", "missed"]; // visit statuses (later phases)

const carers = Array.from({ length: 40 }, (_, i) => ({
  id: `C-${1000 + i}`,
  name: `${FIRST[i % FIRST.length]} ${LAST[(i * 3) % LAST.length]}`,
  region: REGIONS[i % REGIONS.length],
  status: CARER_STATUS[i % CARER_STATUS.length],
  visitsThisWeek: (i * 7) % 23,
}));

// lots of visits -> for virtualization in a later phase
const visits = Array.from({ length: 600 }, (_, i) => {
  const carer = carers[i % carers.length];
  const start = new Date(Date.now() + (i - 100) * 37 * 60000);
  return {
    id: i + 1,
    client: `${FIRST[(i * 7) % FIRST.length]} ${LAST[(i * 5) % LAST.length]}`,
    carerId: carer.id,
    carerName: carer.name,
    region: carer.region,
    scheduledAt: start.toISOString(),
    durationMin: [30, 45, 60][i % 3],
    status: STATUS[i % STATUS.length],
  };
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Mirrors the mui MSW handler: filter by region/status, return { data, total }.
app.get("/api/carers", (req, res) => {
  const { region = "", status = "" } = req.query;
  let result = carers;
  if (region) result = result.filter((c) => c.region === region);
  if (status) result = result.filter((c) => c.status === status);
  res.json({ data: result, total: result.length });
});

app.get("/api/visits", (_req, res) => res.json(visits));

// --- SSE: live alerts (for the real-time phase) ---
app.get("/api/events", (req, res) => {
  res.set({ "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
  res.flushHeaders();
  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  send("hello", { ts: Date.now() });
  const iv = setInterval(() => {
    const v = visits[Math.floor(Math.random() * visits.length)];
    send("alert", {
      id: Date.now(),
      level: ["info", "warning", "critical"][Math.floor(Math.random() * 3)],
      message: `Visit #${v.id} (${v.client}) — ${["delay", "status change", "check-in"][Math.floor(Math.random() * 3)]}`,
      visitId: v.id,
      ts: Date.now(),
    });
  }, 6000);
  req.on("close", () => clearInterval(iv));
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Mock Care API runs na http://localhost:${PORT}`));
