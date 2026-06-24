# care-api — shared backend

Jeden malý reálny backend pre obe učebné frontend appky (`care-ops-console`,
`care-ops-mui`). Žiadna databáza — dáta sú **in-memory**, naseedované pri štarte
a resetnú sa pri reštarte.

## Stack
- **Express 5 + TypeScript**, spúšťané cez **tsx** (žiadny build step).
- **In-memory** dáta (carers, visits, chat messages).
- **SSE** (`/api/events`) — real-time alerty + nové chat správy.
- **OpenAPI** (`openapi.yaml`) = kontrakt, z ktorého frontendy generujú TS typy.

## Spustenie
```sh
npm install
npm run dev      # http://localhost:3001  (tsx watch — reload pri zmene)
```

## Endpointy
| Metóda | Cesta | Popis |
|---|---|---|
| GET | `/api/health` | health check |
| GET | `/api/carers?region=&status=` | zoznam opatrovateľov, `{ data, total }` |
| GET | `/api/visits?status=&carerId=&limit=` | zoznam návštev (600 riadkov) |
| GET | `/api/messages?channelId=ops` | chat správy |
| POST | `/api/messages` | pridať správu (broadcast cez SSE) |
| GET | `/api/events` | **SSE** stream: `hello`, `alert` (každých 6s), `message` |
| GET | `/openapi.yaml` | samotný kontrakt |

## Typy z kontraktu
Frontendy generujú TS typy z `openapi.yaml`:
```sh
# v každom frontende
npm run gen:api      # openapi-typescript ../care-api/openapi.yaml -> src/lib/api-types.ts
```
Tým je TS typ na frontende vždy odvodený zo serverového kontraktu — to je presne
JD bod „types generated from server contracts“.

## Štruktúra
```
src/
  data.ts     — domény (typy) + in-memory seed
  sse.ts      — SSE hub (broadcast pripojeným klientom)
  server.ts   — Express app + routy
openapi.yaml  — kontrakt (zdroj pravdy pre typy)
```
