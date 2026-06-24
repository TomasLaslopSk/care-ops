# Care Ops Console — learning project for the Cera Senior Frontend Engineer role

Goal: build a care-operations operator dashboard and, along the way, learn the **entire Cera stack** from the JD. Each phase = one technology + a slice of the app + the JD bullet it satisfies.

**Stack:** React 19 · TypeScript strict · Tailwind v4 (token-driven) · TanStack Router/Query/Store/Virtual · SSE real-time · type-safe API client from OpenAPI · agent-supervision UI · tests/a11y/perf.
**Backend:** small mock Node server (`server/index.js`) — REST + SSE, OpenAPI added later.

## Run
```sh
npm install
npm run dev      # starts mock API (:3001) and web (:5173) together
```

## Phases

**Phase 0 — Scaffold ✅ (done)**
Vite + React 19 + **TS strict** + **Tailwind v4** (design tokens via `@theme`) + **TanStack Router** (sidebar/topbar shell, routes Dashboard/Visits/Carers) + mock server (REST + SSE skeleton).
→ JD: "modern stack", "coherent design system / interaction grammar".

**Phase 1 — Design system (Tailwind tokens) ✅ (done)**
Token-driven components: Button (variants/sizes), Card, Badge (tones), Stat (composes Card) — all from tokens, not ad-hoc styles. `cn()` helper for conditional classes. Wired into Dashboard. (Table primitives + loading/empty/error patterns will land alongside the data phases.)
→ JD: "token-driven system, not just style components".

**Phase 2 — Type-safe API client (end-to-end types)**
OpenAPI spec for the mock server → generated TS client (`openapi-typescript`). No more handwritten fetches.
→ JD: "generated clients, end-to-end types. Handwritten fetches scare you."

**Phase 3 — TanStack Query**
Load carers/visits, caching, mutations (change visit status), optimistic update, error/retry.
→ JD: "TanStack Query… live state, no per-feature plumbing".

**Phase 4 — TanStack Virtual (high-density operator surface)**
Virtualized table of 600+ visits — smooth scrolling, sticky header, sort/filter. This is the "command-centre" dense surface.
→ JD: "TanStack Virtual", "high-density operator surfaces".

**Phase 5 — Real-time (SSE + Query)**
Live alert feed over SSE → patch/invalidate in Query. No per-feature plumbing, live state under load.
→ JD: "real-time through SSE and TanStack Query, live state".

**Phase 6 — TanStack Store + interactions**
Global UI state (filters, selection). `cmdk` command palette, `dnd-kit` task kanban.
→ JD: "TanStack Store", "cmdk, dnd-kit".

**Phase 7 — Agent-supervision surface (Cera's differentiator)**
AI assistant panel: suggestions with **provenance/citations**, **override**, **capture rationale**, streamed response. "A colleague the operator works with", not a chatbot.
→ JD: "agent-supervision surfaces… provenance, override, capture rationale", "LLM-powered UI".

**Phase 8 — Quality (your home turf)**
Vitest + Testing Library + Playwright, **WCAG** accessibility on dense UI (keyboard, ARIA), **performance budgets**, observability hooks.
→ JD: "Hold quality together. Testing, accessibility, performance budgets, observability."

**Phase 9 — Complexity reduction + portfolio**
Clean up, simplify, write a README with the "what I built and what I'd remove" story. This is your interview narrative arc.
→ JD: "reduce complexity… point to what you removed".

## Using this in the interview (Charlene / consultation)
For each phase, jot down 1–2 sentences: "what I did and why" — you'll end up with concrete evidence for every JD requirement. Plus the parallel: you just did exactly this (migration, simplification, AI-native pace) on the luxvlasy production eshop.
