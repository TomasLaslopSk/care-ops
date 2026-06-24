import type { Carer, CarerStatus, Region } from "../../types";
import { REGIONS } from "../../types";

const statuses: CarerStatus[] = ["active", "active", "active", "inactive", "onboarding"];
const firstNames = ["Amara", "Ben", "Chloe", "Dani", "Ewan", "Farah", "Greg", "Hana", "Iris", "Jon"];
const lastNames = ["Okoro", "Smith", "Doyle", "Patel", "Murray", "Khan", "Walsh", "Nagy", "Reed", "Cole"];

// Deterministic-ish mock dataset (mirrors packages/mocks/src/data/carers.ts).
export const carers: Carer[] = Array.from({ length: 40 }, (_, i) => ({
  id: `C-${1000 + i}`,
  name: `${firstNames[i % firstNames.length]} ${lastNames[(i * 3) % lastNames.length]}`,
  region: REGIONS[i % REGIONS.length] as Region,
  status: statuses[i % statuses.length],
  visitsThisWeek: (i * 7) % 23,
}));
