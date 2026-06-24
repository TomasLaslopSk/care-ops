import { useState } from "react";
import { useGetAgentRuns, useDecideAgentRun } from "../hooks/useAgentRuns";
import type { AgentRun } from "../types";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";

const statusTone = (s: AgentRun["status"]) =>
  s === "approved" ? "success" : s === "overridden" ? "warning" : "info";

function RunCard({ run }: { run: AgentRun }) {
  const decide = useDecideAgentRun();
  const [note, setNote] = useState("");
  const decided = run.status !== "proposed";

  return (
    <Card>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Badge tone="info">{run.agent}</Badge>
          <span className="text-sm font-semibold">{run.task}</span>
        </div>
        <Badge tone={statusTone(run.status)}>{run.status}</Badge>
      </div>
      <p className="text-xs text-muted mb-3">
        {run.project} · {run.id} · generated {new Date(run.createdAt).toLocaleString()}
      </p>

      <p className="text-sm mb-3">{run.summary}</p>

      {/* Provenance — where this came from */}
      <div className="text-xs text-muted mb-3 space-y-0.5">
        <div><span className="text-text">Skill:</span> {run.provenance.skill}</div>
        <div><span className="text-text">Scope:</span> {run.provenance.scope}</div>
        <div><span className="text-text">Prompt:</span> “{run.provenance.prompt}”</div>
      </div>

      <details className="mb-3">
        <summary className="text-sm text-primary cursor-pointer">Agent rationale</summary>
        <p className="text-sm text-muted mt-1 whitespace-pre-wrap">{run.rationale}</p>
      </details>

      <details className="mb-3">
        <summary className="text-sm text-primary cursor-pointer">Proposed diff</summary>
        <pre className="mt-2 text-xs bg-bg border border-border rounded-lg p-3 overflow-auto whitespace-pre">{run.diff}</pre>
      </details>

      {decided ? (
        <p className="text-xs text-muted">
          {run.status} {run.decisionNote ? `— “${run.decisionNote}”` : ""}
          {run.decidedAt ? ` · ${new Date(run.decidedAt).toLocaleString()}` : ""}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Rationale (required when overriding)…"
            className="h-9 rounded-lg bg-surface-2 border border-border px-3 text-sm text-text focus:outline-none focus:border-primary"
          />
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              disabled={decide.isPending}
              onClick={() => decide.mutate({ id: run.id, decision: "approved", note })}
            >
              Approve
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={decide.isPending || !note.trim()}
              onClick={() => decide.mutate({ id: run.id, decision: "overridden", note })}
            >
              Override
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function AgentRuns() {
  const { data, isLoading, isError } = useGetAgentRuns();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Agent runs</h1>
      <p className="text-muted text-sm mb-6">
        Overnight AI agents propose changes to our apps. Review the diff + rationale, then approve or override.
      </p>

      {isLoading ? (
        <p className="text-muted text-sm">Loading…</p>
      ) : isError ? (
        <p className="text-danger">Failed to load agent runs.</p>
      ) : (
        <div className="flex flex-col gap-4 max-w-3xl">
          {data?.data.map((r) => <RunCard key={r.id} run={r} />)}
        </div>
      )}
    </div>
  );
}
