import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

// Surface container. The visual base for almost every block in the app.
export default function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg bg-surface border border-border p-4", className)}
      {...props}
    />
  );
}
