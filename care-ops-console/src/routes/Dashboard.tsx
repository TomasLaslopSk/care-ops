import Stat from "../components/ui/Stat";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import useGetStats from "../hooks/useGetStats";
import useAlertStream from "../hooks/useAlertStream";
import type { Alert } from "../types";

const alertTone = (level: Alert["level"]) =>
  level === "critical" ? "danger" : level === "warning" ? "warning" : "info";

const time = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function Dashboard() {
  // Counts come from care-api (GET /api/stats), not from counting full lists client-side.
  const { data: stats, isError } = useGetStats();
  const alerts = useAlertStream();

  const val = (n?: number) => (isError ? "!" : stats ? n : "—");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-muted text-sm">Care operations overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label="Today's visits" value={val(stats?.todaysVisits)} hint="Scheduled today" />
        <Stat label="Active carers" value={val(stats?.activeCarers)} hint={`of ${stats?.totalCarers ?? "—"} total`} />
        <Stat label="Live alerts" value={alerts.length} hint="This session (SSE)" />
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Live alerts</h2>
          <span className="flex items-center gap-2 text-xs text-muted">
            <span className="inline-flex h-2 w-2 rounded-full bg-success animate-pulse" /> streaming
          </span>
        </div>
        {alerts.length === 0 ? (
          <p className="text-muted text-sm">Waiting for alerts… (the backend emits one every few seconds)</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {alerts.map((a) => (
              <li key={a.id} className="flex items-center gap-3 text-sm">
                <Badge tone={alertTone(a.level)}>{a.level}</Badge>
                <span className="flex-1">{a.message}</span>
                <span className="text-xs text-muted">{time(a.ts)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
