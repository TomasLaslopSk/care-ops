import { useState } from "react";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import useGetClients from "../hooks/useGetClients";
import useGetCarers from "../hooks/useGetCarers";
import useCreateVisit from "../hooks/useCreateVisit";

// Create form used by the Scheduling page: client/carer/time + the tasks the carer
// must complete on the visit.
export default function NewVisitForm({ onDone }: { onDone: () => void }) {
  const { data: clients } = useGetClients();
  const { data: carers } = useGetCarers("", "");
  const create = useCreateVisit();

  const [clientId, setClientId] = useState("");
  const [carerId, setCarerId] = useState("");
  const [when, setWhen] = useState("");
  const [durationMin, setDurationMin] = useState(30);
  const [tasks, setTasks] = useState<string[]>(["Medication", "Personal care"]);

  const setTask = (i: number, value: string) => setTasks((t) => t.map((x, idx) => (idx === i ? value : x)));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !carerId || !when) return;
    create.mutate(
      {
        clientId,
        carerId,
        scheduledAt: new Date(when).toISOString(),
        durationMin,
        tasks: tasks.map((t) => t.trim()).filter(Boolean),
      },
      { onSuccess: onDone },
    );
  };

  return (
    <Box component="form" onSubmit={submit} sx={{ maxWidth: 640 }}>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", mb: 3 }}>
        <FormControl size="small" sx={{ width: 200 }}>
          <InputLabel>Client</InputLabel>
          <Select label="Client" value={clientId} onChange={(e) => setClientId(e.target.value)}>
            {(clients?.data ?? []).map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ width: 200 }}>
          <InputLabel>Carer</InputLabel>
          <Select label="Carer" value={carerId} onChange={(e) => setCarerId(e.target.value)}>
            {(carers?.data ?? []).map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          size="small"
          type="datetime-local"
          label="When"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          size="small"
          type="number"
          label="Minutes"
          value={durationMin}
          onChange={(e) => setDurationMin(Number(e.target.value))}
          sx={{ width: 100 }}
        />
      </Box>

      <Typography variant="caption" color="text.secondary">
        Tasks the carer must complete
      </Typography>
      <Stack spacing={1} sx={{ mt: 1, mb: 3 }}>
        {tasks.map((t, i) => (
          <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              size="small"
              fullWidth
              value={t}
              onChange={(e) => setTask(i, e.target.value)}
              placeholder={`Task ${i + 1}`}
            />
            <Button size="small" onClick={() => setTasks((x) => x.filter((_, idx) => idx !== i))}>
              Remove
            </Button>
          </Box>
        ))}
        <Box>
          <Button size="small" variant="outlined" onClick={() => setTasks((x) => [...x, ""])}>
            + Add task
          </Button>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1}>
        <Button type="submit" variant="contained" disabled={create.isPending || !clientId || !carerId || !when}>
          Schedule visit
        </Button>
        <Button onClick={onDone}>Cancel</Button>
      </Stack>
    </Box>
  );
}
