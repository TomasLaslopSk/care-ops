# Deploy — Care Ops live (one URL: prevlasy.sk)

We ship **one service**: `care-api` (Node) serves the API **and** the built React app
(`care-ops-console`) from the same origin. Data persists on a small **volume**. Push to
GitHub `main` → it redeploys automatically.

```
GitHub (main) ──push──► Railway builds Dockerfile ──► one service
                                                   ├─ serves React web  (/, /visits, …)
                                                   ├─ serves API        (/api/*)
                                                   ├─ Swagger            (/docs)
                                                   └─ data on volume     (/data/data.json)
GitHub Actions (nightly cron) ──► posts an agent run ──► live /api/agent-runs ──► admin sees it
```

## 0. One-time: put it on GitHub
```sh
cd ~/Documents/tilea
git init && git add . && git commit -m "Care Ops MVP"
# create an empty repo on github.com, then:
git remote add origin git@github.com:<you>/care-ops.git
git push -u origin main
```
(`.gitignore` already excludes node_modules/dist/data.json.) CI (`.github/workflows/ci.yml`)
runs tests + build on every push.

## 1. Deploy on Railway (simplest, closest to what you know)
1. railway.app → **New Project → Deploy from GitHub repo** → pick the repo.
2. Railway detects the **Dockerfile** at the repo root and builds it. No other config needed.
3. **Add a Volume**: service → *Variables/Volumes* → New Volume, mount path **`/data`**
   (so `data.json` survives redeploys). Our app already uses `DATA_DIR=/data`.
4. **Environment variables** (service → Variables):
   - `AGENT_INGEST_KEY` = a long random secret (NOT "dev-agent-key").
   - (PORT is set by Railway automatically; `FRONTEND_DIST` + `DATA_DIR` come from the Dockerfile.)
5. Railway gives you a URL like `care-ops-production.up.railway.app`. Open it → the React app loads, login works, `/docs` shows Swagger.

## 2. Custom domain prevlasy.sk
1. Railway → service → *Settings → Domains → Custom Domain* → enter `care.prevlasy.sk` (or the root).
2. Railway shows a **CNAME** target. Add it in your DNS (Websupport DNS panel) as a CNAME record. TLS is automatic.
3. Done — `https://care.prevlasy.sk` is live.

## 3. Cloud night agent (no Mac needed)
The workflow `.github/workflows/night-agent.yml` runs nightly. Add two **GitHub repo secrets**
(repo → Settings → Secrets and variables → Actions):
- `AGENT_API` = your live URL, e.g. `https://care.prevlasy.sk`
- `AGENT_INGEST_KEY` = the same secret as on Railway
Now every night (or via *Actions → night-agent → Run workflow*) it posts an agent run to the
live API → log in as **admin** → **Agent runs** → approve/override. Live, hands-off.

## 4. Next learning step — a real database (Prisma)
Today persistence is a JSON file on the volume (simple, real, survives restarts). The clean
upgrade is **Prisma**:
- Start with **SQLite** (`datasource db { provider = "sqlite"; url = "file:/data/care.db" }`) —
  one file on the same volume, easiest to learn. `prisma migrate` + a `seed` script, then
  swap `store.ts`/array access for Prisma calls.
- Later flip `provider` to **postgresql** and point `DATABASE_URL` at a managed Postgres
  (Railway Postgres / Neon / Supabase) — same Prisma code, just a provider + URL change.
We'll do this together so you understand each step.

## Notes
- Demo data is fake/seeded — safe to be public. Keep `AGENT_INGEST_KEY` secret; consider
  locking CORS to your domain if you split API onto a separate origin later.
- Only `care-ops-console` + `care-api` are deployed. `care-ops-mui` (comparison) and
  `care-carer-kmp` (mobile) are not web-hosted.
