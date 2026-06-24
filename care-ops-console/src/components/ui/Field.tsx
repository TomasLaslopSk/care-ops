import type { SelectHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

// Small form primitives styled to resemble MUI's outlined fields (dark theme).
// Label sits above the control; error text shows below.

const controlBase =
  "w-full h-10 rounded-lg bg-surface-2 border border-border px-3 text-sm text-text " +
  "focus:outline-none focus:border-primary transition-colors";

export function SelectField({
  label,
  error,
  className,
  children,
  ...props
}: { label: string; error?: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className={cn("flex flex-col gap-1", className)}>
      <span className="text-xs text-muted">{label}</span>
      <select className={cn(controlBase, error && "border-danger")} {...props}>
        {children}
      </select>
      {error && <span className="text-xs text-danger">{error}</span>}
    </label>
  );
}

export function TextField({
  label,
  error,
  className,
  ...props
}: { label: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn("flex flex-col gap-1", className)}>
      <span className="text-xs text-muted">{label}</span>
      <input className={cn(controlBase, error && "border-danger")} {...props} />
      {error && <span className="text-xs text-danger">{error}</span>}
    </label>
  );
}

export function FieldHint({ children }: { children: ReactNode }) {
  return <span className="text-xs text-muted">{children}</span>;
}
