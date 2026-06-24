import Chip from "@mui/material/Chip";
import type { CarerStatus } from "../types";

// MUI Chip equivalent of the Tailwind Badge. Color comes from the theme palette
// (success/warning/default), not hard-coded values.
const colorByStatus: Record<CarerStatus, "success" | "warning" | "default"> = {
  active: "success",
  onboarding: "warning",
  inactive: "default",
};

export default function StatusChip({ status }: { status: CarerStatus }) {
  return <Chip label={status} color={colorByStatus[status]} size="small" variant="outlined" />;
}
