import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import useGetCarers from "../hooks/useGetCarers";
import useGetVisits from "../hooks/useGetVisits";
import useAlertStream from "../hooks/useAlertStream";
import type { Alert } from "../types";

const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();
const alertColor = (level: Alert["level"]) =>
  level === "critical" ? "error" : level === "warning" ? "warning" : "info";
const time = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function StatCard({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={700}>{value}</Typography>
        <Typography variant="caption" color="text.secondary">{hint}</Typography>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: carers } = useGetCarers("", "");
  const { data: visits } = useGetVisits(600);
  const alerts = useAlertStream();

  const activeCarers = (carers?.data ?? []).filter((c) => c.status === "active").length;
  const todaysVisits = (visits?.data ?? []).filter((v) => isToday(v.scheduledAt)).length;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">Care operations overview.</Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2 }}>
        <StatCard label="Today's visits" value={visits ? todaysVisits : "—"} hint="Scheduled today" />
        <StatCard label="Active carers" value={carers ? activeCarers : "—"} hint={`of ${carers?.total ?? "—"} total`} />
        <StatCard label="Live alerts" value={alerts.length} hint="This session (SSE)" />
      </Box>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Typography fontWeight={600}>Live alerts</Typography>
            <Typography variant="caption" color="text.secondary">● streaming</Typography>
          </Box>
          {alerts.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Waiting for alerts… (the backend emits one every few seconds)
            </Typography>
          ) : (
            <Stack spacing={1}>
              {alerts.map((a) => (
                <Box key={a.id} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Chip label={a.level} color={alertColor(a.level)} size="small" variant="outlined" />
                  <Typography variant="body2" sx={{ flex: 1 }}>{a.message}</Typography>
                  <Typography variant="caption" color="text.secondary">{time(a.ts)}</Typography>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
