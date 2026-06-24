import type { ReactNode } from "react";
import Card from "./Card";

interface StatProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
}

// A single KPI tile. Composes Card — shows how primitives build bigger pieces.
export default function Stat({ label, value, hint }: StatProps) {
  return (
    <Card>
      <div className="text-muted text-xs uppercase tracking-wide">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
      {hint && <div className="text-muted text-xs mt-1">{hint}</div>}
    </Card>
  );
}
