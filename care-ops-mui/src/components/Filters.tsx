import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { useShallow } from "zustand/shallow";
import useCarersStore from "../store/useCarersStore";
import { REGIONS, type CarerStatus } from "../types";

const STATUSES: CarerStatus[] = ["active", "inactive", "onboarding"];

// Mirrors micro-fes apps/carers/src/components/Filters.tsx:
// MUI Select/FormControl + zustand store read via useShallow.
function Filters() {
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
    <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3, flexWrap: "wrap" }}>
      <FormControl sx={{ width: 200 }} size="small">
        <InputLabel>Region</InputLabel>
        <Select label="Region" value={region} onChange={(e) => setRegion(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          {REGIONS.map((r) => (
            <MenuItem value={r} key={r}>
              {r}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ width: 200 }} size="small">
        <InputLabel>Status</InputLabel>
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as CarerStatus | "")}
        >
          <MenuItem value="">All</MenuItem>
          {STATUSES.map((s) => (
            <MenuItem value={s} key={s}>
              {s}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        disabled={!region && !status}
        variant="outlined"
        size="medium"
        onClick={clear}
        sx={{ ml: "auto" }}
      >
        Clear filters
      </Button>
    </Box>
  );
}

export default Filters;
