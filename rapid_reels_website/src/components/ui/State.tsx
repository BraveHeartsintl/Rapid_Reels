"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="space-y-3" aria-busy="true">
      <p className="text-sm text-[var(--rr-text-tertiary)]">{label}</p>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-2xl bg-[var(--rr-card)]" />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card className="border-[var(--rr-error)]/50">
      <p className="text-sm font-medium text-[var(--rr-error)]">Could not load data</p>
      <p className="mt-1 break-words text-xs text-[var(--rr-text-secondary)]">{message}</p>
      {onRetry ? (
        <Button type="button" variant="outline" className="mt-3 px-4 py-2 text-xs" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </Card>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <Card className="py-8 text-center text-sm text-[var(--rr-text-tertiary)]">{children}</Card>
  );
}

/**
 * Renders loading / error / empty states around async data.
 * `isEmpty` defaults to "data is an empty array".
 */
export function AsyncView<T>({
  state,
  empty = "Nothing here yet.",
  isEmpty,
  children,
}: {
  state: { data: T | undefined; loading: boolean; error: string | null; reload: () => void };
  empty?: ReactNode;
  isEmpty?: (data: T) => boolean;
  children: (data: T) => ReactNode;
}) {
  if (state.loading) return <Loading />;
  if (state.error) return <ErrorState message={state.error} onRetry={state.reload} />;
  if (state.data === undefined || state.data === null) return <Empty>{empty}</Empty>;
  const emptyCheck = isEmpty ?? ((d: T) => Array.isArray(d) && d.length === 0);
  if (emptyCheck(state.data)) return <Empty>{empty}</Empty>;
  return <>{children(state.data)}</>;
}

export function Notice({ tone = "error", children }: { tone?: "error" | "success"; children: ReactNode }) {
  return (
    <p
      role="alert"
      className={
        tone === "error"
          ? "rounded-xl bg-[var(--rr-error)]/10 px-3 py-2 text-xs text-[var(--rr-error)]"
          : "rounded-xl bg-[var(--rr-success)]/10 px-3 py-2 text-xs text-[var(--rr-success)]"
      }
    >
      {children}
    </p>
  );
}
