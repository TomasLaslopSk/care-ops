import { useShallow } from "zustand/shallow";
import useCarersStore from "../store/useCarersStore";
import { REGIONS, type CarerStatus } from "../types";
import { SelectField } from "./ui/Field";
import Button from "./ui/Button";

const STATUSES: CarerStatus[] = ["active", "inactive", "onboarding"];

// Tailwind equivalent of care-ops-mui Filters.tsx — same behavior:
// MUI Select -> native <select>, zustand store read via useShallow.
export default function Filters() {
  const { region, status, setRegion, setStatus, clear } = useCarersStore(
    useShallow((s) => ({
      region: s.region,
      status: s.status,
      setRegion: s.setRegion,
      setStatus: s.setStatus,
      clear: s.clear,
    })),
  );

  return (
    <div className="flex gap-3 items-end mb-4 flex-wrap">
      <SelectField
        label="Region"
        className="w-48"
        value={region}
        onChange={(e) => setRegion(e.target.value)}
      >
        <option value="">All</option>
        {REGIONS.map((r) => (
          <option value={r} key={r}>
            {r}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="Status"
        className="w-48"
        value={status}
        onChange={(e) => setStatus(e.target.value as CarerStatus | "")}
      >
        <option value="">All</option>
        {STATUSES.map((s) => (
          <option value={s} key={s}>
            {s}
          </option>
        ))}
      </SelectField>

      <Button variant="secondary" disabled={!region && !status} onClick={clear} className="ml-auto">
        Clear filters
      </Button>
    </div>
  );
}
