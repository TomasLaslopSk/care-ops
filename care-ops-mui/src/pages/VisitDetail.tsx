import { useParams, Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import CircularProgress from "@mui/material/CircularProgress";
import useGetVisit from "../hooks/useGetVisit";
import type { VisitStatus } from "../types";

const colorByStatus: Record<VisitStatus, "default" | "info" | "success" | "error"> = {
  scheduled: "default",
  in_progress: "info",
  completed: "success",
  missed: "error",
};

const fmt = (iso?: string) =>
  iso ? new Date(iso).toLocaleString([], { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.75 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}

export default function VisitDetail() {
  const { id = "" } = useParams();
  const { data: v, isLoading, isError } = useGetVisit(id);

  return (
    <Box>
      <Link component={RouterLink} to="/visits" underline="hover">
        ← Back to visits
      </Link>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : isError || !v ? (
        <Typography color="error" sx={{ mt: 3 }}>
          Failed to load visit.
        </Typography>
      ) : (
        <Box sx={{ mt: 2, maxWidth: 640 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
            <Typography variant="h5" fontWeight={700}>{v.client}</Typography>
            <Chip label={v.status.replace("_", " ")} color={colorByStatus[v.status]} size="small" variant="outlined" />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Visit {v.id}
          </Typography>

          <Paper sx={{ p: 2, mb: 2 }}>
            <Field label="Carer" value={v.carerName} />
            <Field label="Client address" value={v.clientAddress} />
            <Field label="Scheduled" value={`${fmt(v.scheduledAt)} · ${v.durationMin} min`} />
            <Field label="Checked in" value={fmt(v.checkInAt)} />
            <Field label="Checked out" value={fmt(v.checkOutAt)} />
          </Paper>

          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography fontWeight={600} sx={{ mb: 1 }}>Tasks</Typography>
            {v.tasks.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No tasks defined.</Typography>
            ) : (
              v.tasks.map((t) => (
                <Box key={t.id} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.25 }}>
                  <Typography component="span" sx={{ color: t.done ? "success.main" : "text.secondary" }}>
                    {t.done ? "✓" : "○"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ textDecoration: t.done ? "line-through" : "none", color: t.done ? "text.secondary" : "text.primary" }}
                  >
                    {t.label}
                  </Typography>
                </Box>
              ))
            )}
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography fontWeight={600} sx={{ mb: 1 }}>Visit report</Typography>
            {v.report ? (
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{v.report}</Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">No report submitted yet.</Typography>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
}
