import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--rr-outline)]/60 bg-[var(--rr-card)] p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "primary",
}: {
  children: React.ReactNode;
  tone?: "primary" | "success" | "warning" | "muted" | "secondary";
}) {
  const tones = {
    primary: "bg-[var(--rr-primary)]/20 text-[var(--rr-secondary)]",
    success: "bg-[var(--rr-success)]/15 text-[var(--rr-success)]",
    warning: "bg-[var(--rr-warning)]/15 text-[var(--rr-warning)]",
    muted: "bg-white/5 text-[var(--rr-text-tertiary)]",
    secondary: "bg-[var(--rr-secondary)]/15 text-[var(--rr-secondary)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
