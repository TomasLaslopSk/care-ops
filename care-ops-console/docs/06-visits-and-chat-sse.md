# Visits (tabuľka dát) + Chat (real-time cez SSE)

Dve nové obrazovky, obe ťahajú z `care-api`. Visits je čistý read (React Query),
Chat pridáva **real-time** cez Server-Sent Events — to je ten JD bod
„real-time through SSE and TanStack Query, live state“.

## Súbory
```
hooks/useGetVisits.ts     — RQ dotaz GET /api/visits?limit=
routes/Visits.tsx         — tabuľka návštev + loading/error
hooks/useGetMessages.ts   — RQ dotaz GET /api/messages (úvodné načítanie)
hooks/useChatStream.ts    — SSE: EventSource -> patchuje cache správ
hooks/usePostMessage.ts   — RQ mutation POST /api/messages
routes/Chat.tsx           — zoznam správ + input + odoslanie
```

## Visits — nič nové, len ďalší React Query dotaz
`useGetVisits(limit)` je rovnaký vzor ako `useGetCarers` — `useQuery` + axios +
typovaná odpoveď (`VisitsResponse` z kontraktu). Stránka rieši loading/error a vykreslí
tabuľku. `limit=200` (z 600), aby bola tabuľka svižná. (Neskôr sa dá zvvirtualizovať
cez TanStack Virtual — JD bod „high-density operator surfaces“.)

## Chat — ako funguje real-time

**Tok dát:**
1. `useGetMessages("ops")` raz načíta históriu správ do React Query cache.
2. `useChatStream("ops")` otvorí **jeden** `EventSource("/api/events")` a počúva
   `message` eventy. Pri každom novom evente **patchne tú istú cache** (cez
   `queryClient.setQueryData`), deduplikuje podľa `id`.
3. `Chat.tsx` číta `useGetMessages` data → keď SSE patchne cache, komponent sa
   automaticky prekreslí. Žiadny polling, žiadny manuálny stav.
4. `usePostMessage` pošle správu (POST). Server ju **broadcastne cez SSE** všetkým
   klientom (vrátane teba), takže sa objaví u každého. Na success ju aj rovno
   pridáme do cache (svižnosť) — SSE kópia sa deduplikuje.

**Kľúčový kód (`useChatStream.ts`):**
```ts
const es = new EventSource("/api/events");
es.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data) as Message;
  qc.setQueryData<MessagesResponse>([queryKeys.getMessages, channelId], (prev) => {
    if (!prev) return { data: [msg], total: 1 };
    if (prev.data.some((m) => m.id === msg.id)) return prev; // dedupe
    return { data: [...prev.data, msg], total: prev.total + 1 };
  });
});
return () => es.close();      // dôležité: zavri spojenie pri unmount
```

## Pojmy
- **SSE (Server-Sent Events)** = jednosmerný stream zo servera do prehliadača cez
  jedno dlhé HTTP spojenie. `EventSource` je natívne API prehliadača — netreba knižnicu.
  (Oproti WebSocketom je jednoduchší a stačí na „server tlačí updaty“.)
- **`EventSource.addEventListener("message")`** = zachytáva `event: message` rámce zo
  servera. Iné názvy (`alert`, `hello`) by mali vlastné listenery.
- **`setQueryData`** = priame zapísanie do React Query cache (namiesto refetchu) —
  ideálne pre push updaty. Komponenty čítajúce ten query sa prekreslia.
- **Cleanup v `useEffect`** = `es.close()` pri unmount, inak by spojenia pribúdali.

## Vyskúšaj real-time
1. Spusti `care-api` + frontend, otvor `/chat`.
2. Otvor `/chat` aj v druhom okne (alebo druhý frontend na :5174).
3. Napíš správu v jednom — objaví sa **okamžite v oboch** (SSE broadcast).
4. Backend navyše každých ~6s posiela `alert` eventy (zatiaľ ich chat ignoruje;
   napojenie alertov na Dashboard je ďalší krok).

## Pre pohovor
"Real-time som spravil cez natívny `EventSource` (SSE) + React Query: SSE event
patchne cache cez `setQueryData` (deduplikované), takže UI je živé bez pollingu a bez
per-komponentového stavu. Odoslanie ide POST-om, server broadcastne všetkým. Spojenie
zatváram v `useEffect` cleanupe. Je to presne ‚live state through SSE and TanStack Query‘ z JD."
