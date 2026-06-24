import { useState } from "react";
import useGetClients from "../hooks/useGetClients";
import useGetCarers from "../hooks/useGetCarers";
import useCreateVisit from "../hooks/useCreateVisit";
import { SelectField, TextField } from "./ui/Field";
import Button from "./ui/Button";

// Create form used by the Scheduling page. Besides client/carer/time it lets the
// operator define the tasks the carer must complete on the visit.
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
  const addTask = () => setTasks((t) => [...t, ""]);
  const removeTask = (i: number) => setTasks((t) => t.filter((_, idx) => idx !== i));

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
    <form onSubmit={submit} className="max-w-2xl">
      <div className="flex gap-3 items-end flex-wrap mb-4">
        <SelectField label="Client" className="w-52" value={clientId} onChange={(e) => setClientId(e.target.value)}>
          <option value="">Select…</option>
          {(clients?.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </SelectField>
        <SelectField label="Carer" className="w-52" value={carerId} onChange={(e) => setCarerId(e.target.value)}>
          <option value="">Select…</option>
          {(carers?.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </SelectField>
        <TextField label="When" type="datetime-local" className="w-52" value={when} onChange={(e) => setWhen(e.target.value)} />
        <TextField
          label="Minutes"
          type="number"
          className="w-24"
          value={durationMin}
          onChange={(e) => setDurationMin(Number(e.target.value))}
        />
      </div>

      <div className="mb-4">
        <p className="text-xs text-muted mb-2">Tasks the carer must complete</p>
        <div className="flex flex-col gap-2">
          {tasks.map((t, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                value={t}
                onChange={(e) => setTask(i, e.target.value)}
                placeholder={`Task ${i + 1}`}
                className="flex-1 h-10 rounded-lg bg-surface-2 border border-border px-3 text-sm text-text focus:outline-none focus:border-primary"
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => removeTask(i)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={addTask} className="mt-2">
          + Add task
        </Button>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={create.isPending || !clientId || !carerId || !when}>
          Schedule visit
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
