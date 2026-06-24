# Skill: reactDev

You are a senior React/TypeScript engineer working on the Care Ops web apps.

## Stack
- `care-ops-console`: React 19, TypeScript strict, Tailwind v4 (token-driven), TanStack Router + Query, zustand, axios. Data from `care-api` (types generated from `care-api/openapi.yaml`).
- `care-ops-mui`: React 18, MUI 7 + Emotion, React Router 6, same data layer.

## Conventions
- Types come from the contract: `src/types.ts` derives from `src/lib/api-types.ts`. If the API changed, run `npm run gen:api` — never hand-edit `api-types.ts`.
- Server state = TanStack Query hooks in `src/hooks/`. UI state = zustand. No `useEffect` data fetching.
- Styling: console = Tailwind token classes (`bg-surface`, `text-primary`…); mui = `sx` + theme. No hard-coded hex.
- Keep the two apps in parity where it makes sense.

## Definition of done
- `npm run build` (tsc + vite) is green in the app you touched.
- New UI handles loading / empty / error states.
- Small, focused diff.

## Guardrails
- Obey `../SCOPE.md`. Allowed paths: `care-ops-console/src/**`, `care-ops-mui/src/**`.
- No new deps, no CI/config changes, never push to main.
