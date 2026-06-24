import { useState } from "react";
import { Link } from "@tanstack/react-router";
import useGetVisits from "../hooks/useGetVisits";
import useGetCarers from "../hooks/useGetCarers";
import useAssignVisit from "../hooks/useAssignVisit";
import type { VisitStatus } from "../types";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import { SelectField } from "../components/ui/Field";

const toneByStatus: Record<VisitStatus, "neutral" | "info" | "success" | "danger"> = {
  scheduled: "neutral",
  in_progress: "info",
  completed: "success",
  missed: "danger",
};

const STATUSES: VisitStatus[] = ["scheduled", "in_progress", "completed", "missed"];

const fmt = (iso: string) =>
  new Date(iso).toLocaleString([], { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export default function Visits() {
  const [status, setStatus] = useState<VisitStatus | "">("");
  const { data, isLoading, isError } = useGetVisits(200, status);
  const { data: carers } = useGetCarers("", "");
  const assign = useAssignVisit();
  const visits = data?.data ?? [];

  return (
    <div>
      <div className="flex items-start justify-between mb-1">
        <h1 className="text-2xl font-bold">Visits</h1>
        <Link
          to="/scheduling"
          className="inline-flex items-center h-10 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90"
        >
          New visit
        </Link>
      </div>
      <p className="text-muted text-sm mb-4">
        Live schedule from care-api{data ? ` — showing ${visits.length} of ${data.total}` : ""}. Reassign a carer in the Carer column.
      </p>

      <div className="flex gap-3 items-end mb-4 flex-wrap">
        <SelectField
          label="Status"
          className="w-48"
          value={status}
          onChange={(e) => setStatus(e.target.value as VisitStatus | "")}
        >
          <option value="">All</option>
          {STATUSES.map((s) => (
            <option value={s} key={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </SelectField>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="h-6 w-6 rounded-full border-2 border-border border-t-primary animate-spin" />
        </div>
      ) : isError ? (
        <p className="text-danger py-8">Failed to load visits.</p>
      ) : visits.length === 0 ? (
        <p className="text-muted py-8">No visits match this filter.</p>
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-border">
                <th className="px-4 py-2 font-medium">Visit</th>
                <th className="px-4 py-2 font-medium">Client</th>
                <th className="px-4 py-2 font-medium">Carer (reassign)</th>
                <th className="px-4 py-2 font-medium">Scheduled</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((v) => (
                <tr key={v.id} className="border-b border-border/60 hover:bg-surface-2 transition-colors">
                  <td className="px-4 py-2">
                    <Link
                      to="/visits/$visitId"
                      params={{ visitId: v.id }}
                      className="text-primary hover:underline"
                    >
                      {v.id}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{v.client}</td>
                  <td className="px-4 py-2">
                    <select
                      value={v.carerId}
                      disabled={assign.isPending}
                      onChange={(e) => assign.mutate({ visitId: v.id, carerId: e.target.value })}
                      className="h-8 rounded-lg bg-surface-2 border border-border px-2 text-sm text-text focus:outline-none focus:border-primary"
                    >
                      {(carers?.data ?? []).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">{fmt(v.scheduledAt)}</td>
                  <td className="px-4 py-2">
                    <Badge tone={toneByStatus[v.status]}>{v.status.replace("_", " ")}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
