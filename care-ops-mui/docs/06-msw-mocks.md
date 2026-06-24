# `src/mocks/*` — MSW mock API

> **Aktualizácia:** appka teraz ťahá dáta z reálneho zdieľaného backendu `care-api`
> (cez Vite `/api` proxy). MSW je ponechané v `src/mocks` ako referencia a je
> **vypnuté** cez `USE_MOCKS = false` v `index.tsx`. Nižšie zostáva pôvodný popis,
> lebo MSW je dôležitá technika (testy, práca bez backendu) a v Cere ho používajú.

## Čo to je
MSW (Mock Service Worker) zachytáva HTTP requesty v prehliadači a odpovedá vlastnými
dátami. Appka si myslí, že hovorí s reálnym serverom. Presne ako `packages/mocks` v micro-fes.

## Súbory
```
src/mocks/
  data/carers.ts   — falošný dataset (40 opatrovateľov)
  handlers.ts      — request handlery (čo vrátiť na ktorú URL)
  browser.ts       — service worker pre prehliadač
```
Plus vygenerovaný `public/mockServiceWorker.js` (samotný service worker súbor).

## `handlers.ts` — jadro
```ts
import { http, HttpResponse } from "msw";
import { carers } from "./data/carers";

export const handlers = [
  http.get("/api/carers", ({ request }) => {
    const url = new URL(request.url);
    const region = url.searchParams.get("region") ?? "";
    const status = url.searchParams.get("status") ?? "";

    let result = carers;
    if (region) result = result.filter((c) => c.region === region);
    if (status) result = result.filter((c) => c.status === status);

    return HttpResponse.json({ data: result, total: result.length });
  }),
];
```
- **`http.get("/api/carers", resolver)`** — "keď príde GET na `/api/carers`, spusti
  túto funkciu". Obdoba pre `post`, `put`, `delete`.
- **Resolver** dostane request, prečíta query params (`region`, `status`), vyfiltruje
  dataset a vráti `HttpResponse.json(...)`. Tým **napodobňuje serverovú logiku** —
  filtrovanie reálne robí "server" (mock), nie frontend.
- Tvar odpovede `{ data, total }` zodpovedá typu `CarersResponse` → frontend kód je
  identický, či odpovedá MSW alebo reálny backend.

## `browser.ts`
```ts
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";
export const worker = setupWorker(...handlers);
```
Vytvorí worker z handlerov. Štartuje sa v `index.tsx` (`await worker.start(...)`) len v dev.

## Prečo MSW (a nie len konštanta v kóde)
- Appka robí **reálne `fetch`/axios** volania — testuješ aj sieťovú vrstvu (loading
  stavy, chyby, query params), nielen UI s napevno vloženými dátami.
- Ten istý mock vieš použiť v **testoch** (Vitest) aj v prehliadači. V micro-fes
  `packages/mocks` zdieľajú appky aj testy.
- Keď príde reálny backend, len vypneš MSW — kód appky sa nemení.

## Pojmy
- **Service worker** = skript bežiaci medzi appkou a sieťou; MSW ho využíva na
  zachytávanie requestov.
- **Handler / resolver** = pravidlo "na túto URL vráť toto".
- **`public/mockServiceWorker.js`** = vygenerovaný súbor (`npx msw init public`),
  musí byť v repo, inak worker v dev nenaštartuje.

## Pre pohovor
"Mockujem cez MSW na úrovni siete — appka robí reálne requesty, takže testujem aj
loading/error/cache, nielen UI. Handlery napodobňujú serverovú logiku (filtrovanie),
tvar odpovede sa zhoduje s TS typom, a ten istý mock ide do testov. To je presne
micro-fes `packages/mocks` prístup."
