import type { Carer, CarerStatus } from "../types";
import Badge from "./ui/Badge";
import Card from "./ui/Card";

interface Props {
  carers: Carer[];
  isLoading: boolean;
  isError: boolean;
}

// Tone mapping mirrors care-ops-mui StatusChip.
const toneByStatus: Record<CarerStatus, "success" | "warning" | "neutral"> = {
  active: "success",
  onboarding: "warning",
  inactive: "neutral",
};

// Tailwind equivalent of care-ops-mui CarersList — same loading/empty/error pattern.
export default function CarersTable({ carers, isLoading, isError }: Props) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-6 w-6 rounded-full border-2 border-border border-t-primary animate-spin" />
      </div>
    );
  }

  if (isError) {
    return <p className="text-danger py-8">Failed to load carers.</p>;
  }

  if (carers.length === 0) {
    return <p className="text-muted py-8">No carers match these filters.</p>;
  }

  return (
    <Card className="p-0 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted border-b border-border">
            <th className="px-4 py-2 font-medium">ID</th>
            <th className="px-4 py-2 font-medium">Name</th>
            <th className="px-4 py-2 font-medium">Region</th>
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium text-right">Visits / week</th>
          </tr>
        </thead>
        <tbody>
          {carers.map((c) => (
            <tr key={c.id} className="border-b border-border/60 hover:bg-surface-2 transition-colors">
              <td className="px-4 py-2">{c.id}</td>
              <td className="px-4 py-2">{c.name}</td>
              <td className="px-4 py-2">{c.region}</td>
              <td className="px-4 py-2">
                <Badge tone={toneByStatus[c.status]}>{c.status}</Badge>
              </td>
              <td className="px-4 py-2 text-right">{c.visitsThisWeek}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
