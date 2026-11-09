"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Badge, Card } from "@/components/ui/Card";
import { AsyncView, Notice } from "@/components/ui/State";
import { listAllReviews, updateReview } from "@/lib/data/queries";
import { toDate } from "@/lib/data/types";
import { errorMessage, fmtDate, titleCase } from "@/lib/format";
import { useAsync } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const FILTERS = ["pending", "approved", "rejected", "all"] as const;

export default function Page() {
  const state = useAsync(listAllReviews, []);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("pending");
  const [error, setError] = useState<string | null>(null);

  async function decide(id: string, approve: boolean) {
    setError(null);
    try {
      await updateReview(id, approve ? { status: "approved", isPublic: true } : { status: "rejected", isPublic: false });
      state.reload();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <div>
      <PageHeader title="Reviews moderation" subtitle="Approve reviews before they appear on provider profiles" />
      <div className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={cn("rounded-full px-3 py-1 text-xs capitalize", filter === f ? "bg-[var(--rr-primary)] text-white" : "bg-[var(--rr-card)] text-[var(--rr-text-tertiary)]")}>{f}</button>
        ))}
      </div>
      {error ? <Notice>{error}</Notice> : null}
      <AsyncView state={state} empty="No reviews yet.">
        {(rows) => {
          const filtered = rows.filter((r) => filter === "all" || (r.status ?? "pending") === filter);
          if (filtered.length === 0) return <p className="text-sm text-[var(--rr-text-tertiary)]">Nothing in this category.</p>;
          return (
            <div className="space-y-2">
              {filtered.map((r) => (
                <Card key={r.id} className="space-y-2 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-white">{"★".repeat(Math.round(r.rating ?? 0))}<span className="text-white/20">{"★".repeat(5 - Math.round(r.rating ?? 0))}</span></p>
                    <Badge tone={r.status === "approved" ? "success" : r.status === "rejected" ? "warning" : "muted"}>{titleCase(r.status ?? "pending")}</Badge>
                  </div>
                  <p className="text-[var(--rr-text-secondary)]">{r.comment || "No comment."}</p>
                  <p className="text-xs text-[var(--rr-text-tertiary)]">{fmtDate(toDate(r.createdAt))} · provider {r.providerId?.slice(0, 6)} · booking #{r.bookingId?.slice(0, 8)}</p>
                  <div className="flex gap-2">
                    {r.status !== "approved" ? <Button type="button" className="px-3 py-1.5 text-xs" onClick={() => decide(r.id, true)}>Approve</Button> : null}
                    {r.status !== "rejected" ? <Button type="button" variant="danger" className="px-3 py-1.5 text-xs" onClick={() => decide(r.id, false)}>Reject</Button> : null}
                  </div>
                </Card>
              ))}
            </div>
          );
        }}
      </AsyncView>
    </div>
  );
}
