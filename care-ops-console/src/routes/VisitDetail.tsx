import { Link, useParams } from "@tanstack/react-router";
import useGetVisit from "../hooks/useGetVisit";
import type { VisitStatus } from "../types";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

const toneByStatus: Record<VisitStatus, "neutral" | "info" | "success" | "danger"> = {
  scheduled: "neutral",
  in_progress: "info",
  completed: "success",
  missed: "danger",
};

const fmt = (iso?: string) =>
  iso ? new Date(iso).toLocaleString([], { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

export default function VisitDetail() {
  const { visitId } = useParams({ from: "/visits/$visitId" });
  const { data: v, isLoading, isError } = useGetVisit(visitId);

  return (
    <div>
      <Link to="/visits" className="text-sm text-primary hover:underline">← Back to visits</Link>

      {isLoading ? (
        <p className="text-muted text-sm mt-6">Loading…</p>
      ) : isError || !v ? (
        <p className="text-danger mt-6">Failed to load visit.</p>
      ) : (
        <div className="mt-4 max-w-2xl">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">{v.client}</h1>
            <Badge tone={toneByStatus[v.status]}>{v.status.replace("_", " ")}</Badge>
          </div>
          <p className="text-muted text-sm mb-6">Visit {v.id}</p>

          <Card className="mb-4">
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-muted">Carer</dt><dd>{v.carerName}</dd>
              <dt className="text-muted">Client address</dt><dd>{v.clientAddress}</dd>
              <dt className="text-muted">Scheduled</dt><dd>{fmt(v.scheduledAt)} · {v.durationMin} min</dd>
              <dt className="text-muted">Checked in</dt><dd>{fmt(v.checkInAt)}</dd>
              <dt className="text-muted">Checked out</dt><dd>{fmt(v.checkOutAt)}</dd>
            </dl>
          </Card>

          <Card className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Tasks</h2>
              {v.tasks.length > 0 && (
                <span className="text-xs text-muted">
                  {v.tasks.filter((t) => t.done).length} / {v.tasks.length} done
                </span>
              )}
            </div>
            {v.tasks.length === 0 ? (
              <p className="text-muted text-sm">No tasks defined.</p>
            ) : (
              <>
                <div className="h-2 w-full rounded-full bg-surface-2 mb-3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-success transition-all"
                    style={{
                      width: `${Math.round((v.tasks.filter((t) => t.done).length / v.tasks.length) * 100)}%`,
                    }}
                  />
                </div>
                <ul className="flex flex-col gap-2 text-sm">
                {v.tasks.map((t) => (
                  <li key={t.id} className="flex items-center gap-2">
                    <span className={t.done ? "text-success" : "text-muted"}>{t.done ? "✓" : "○"}</span>
                    <span className={t.done ? "line-through text-muted" : ""}>{t.label}</span>
                  </li>
                ))}
                </ul>
              </>
            )}
          </Card>

          <Card>
            <h2 className="font-semibold mb-2">Visit report</h2>
            {v.report ? (
              <p className="text-sm whitespace-pre-wrap">{v.report}</p>
            ) : (
              <p className="text-muted text-sm">No report submitted yet.</p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
