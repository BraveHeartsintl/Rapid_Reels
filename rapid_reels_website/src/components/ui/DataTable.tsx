import { cn } from "@/lib/utils";

export function DataTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--rr-outline)]/60 bg-[var(--rr-card)]">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-[var(--rr-outline)]/60 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--rr-text-tertiary)]">
      <tr>{children}</tr>
    </thead>
  );
}

export function TH({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn("px-4 py-3 font-semibold", className)}>{children}</th>;
}

export function TR({ children }: { children: React.ReactNode }) {
  return <tr className="border-b border-[var(--rr-outline)]/40 last:border-0">{children}</tr>;
}

export function TD({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 align-middle text-[var(--rr-text-secondary)]", className)}>{children}</td>;
}
