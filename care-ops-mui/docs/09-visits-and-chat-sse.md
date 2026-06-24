# Visits + Chat (real-time SSE) — mui

Rovnaké funkcie ako v `care-ops-console`, postavené v MUI. Dátová a real-time logika
je **identická** (tie isté hooky), líši sa len UI vrstva.

## Súbory
```
hooks/useGetVisits.ts     — identické s console
hooks/useGetMessages.ts   — identické s console
hooks/useChatStream.ts    — identické s console (SSE -> setQueryData)
hooks/usePostMessage.ts   — identické s console
pages/Visits.tsx          — MUI tabuľka (Table/TableRow/Chip)
pages/Chat.tsx            — MUI Paper + TextField + Button
```

## Čo je rovnaké, čo iné
- **Rovnaké (logika):** všetky štyri hooky sú byte-for-byte zhodné s console.
  Server state = React Query, real-time = `EventSource` patchujúci cache cez
  `setQueryData`. Detailné vysvetlenie SSE je v
  [console doc 06](../../care-ops-console/docs/06-visits-and-chat-sse.md) — neopakujem ho.
- **Iné (UI):** Visits = MUI `Table` + `Chip` (vs Tailwind `<table>` + `Badge`).
  Chat = MUI `Paper`/`TextField`/`Button` (vs Tailwind `Card`/`input`).

## Pre pohovor
"Visits aj Chat (real-time SSE) zdieľajú medzi oboma frontendmi identické hooky —
dátová vrstva je nezávislá od UI knižnice. To je dôkaz, že real-time + server-state
vzor (SSE → `setQueryData` → re-render) viem preniesť kamkoľvek; mení sa len prezentácia."
