import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import { useGetAgentRuns, useDecideAgentRun } from "../hooks/useAgentRuns";
import type { AgentRun } from "../types";

const statusColor = (s: AgentRun["status"]) =>
  s === "approved" ? "success" : s === "overridden" ? "warning" : "info";

function RunCard({ run }: { run: AgentRun }) {
  const decide = useDecideAgentRun();
  const [note, setNote] = useState("");
  const decided = run.status !== "proposed";

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip label={run.agent} color="primary" size="small" variant="outlined" />
          <Typography fontWeight={600}>{run.task}</Typography>
        </Box>
        <Chip label={run.status} color={statusColor(run.status)} size="small" />
      </Box>
      <Typography variant="caption" color="text.secondary">{run.project} · {run.id}</Typography>
      <Typography variant="body2" sx={{ my: 1.5 }}>{run.summary}</Typography>

      <Box sx={{ fontSize: 13, color: "text.secondary", mb: 1 }}>
        <div><b>Skill:</b> {run.provenance.skill}</div>
        <div><b>Scope:</b> {run.provenance.scope}</div>
        <div><b>Prompt:</b> “{run.provenance.prompt}”</div>
      </Box>

      <Accordion disableGutters>
        <AccordionSummary>Agent rationale</AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>{run.rationale}</Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion disableGutters>
        <AccordionSummary>Proposed diff</AccordionSummary>
        <AccordionDetails>
          <Box component="pre" sx={{ fontSize: 12, bgcolor: "background.default", border: "1px solid", borderColor: "divider", borderRadius: 1, p: 1.5, overflow: "auto" }}>
            {run.diff}
          </Box>
        </AccordionDetails>
      </Accordion>

      {decided ? (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          {run.status}{run.decisionNote ? ` — “${run.decisionNote}”` : ""}
        </Typography>
      ) : (
        <Stack spacing={1} sx={{ mt: 1.5 }}>
          <TextField
            size="small"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Rationale (required when overriding)…"
          />
          <Stack direction="row" spacing={1}>
            <Button variant="contained" size="small" disabled={decide.isPending} onClick={() => decide.mutate({ id: run.id, decision: "approved", note })}>
              Approve
            </Button>
            <Button variant="contained" color="error" size="small" disabled={decide.isPending || !note.trim()} onClick={() => decide.mutate({ id: run.id, decision: "overridden", note })}>
              Override
            </Button>
          </Stack>
        </Stack>
      )}
    </Paper>
  );
}

export default function AgentRuns() {
  const { data, isLoading, isError } = useGetAgentRuns();

  return (
    <Box>
      <Typography variant="h5" fontWeight={700}>Agent runs</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Overnight AI agents propose changes to our apps. Review the diff + rationale, then approve or override.
      </Typography>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>
      ) : isError ? (
        <Typography color="error">Failed to load agent runs.</Typography>
      ) : (
        <Stack spacing={2} sx={{ maxWidth: 760 }}>
          {data?.data.map((r) => <RunCard key={r.id} run={r} />)}
        </Stack>
      )}
    </Box>
  );
}
