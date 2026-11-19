"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Card";
import { DataTable, TD, TH, THead, TR } from "@/components/ui/DataTable";
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
            <DataTable>
              <THead>
                <TH>Rating</TH>
                <TH>Comment</TH>
                <TH>When</TH>
                <TH>Status</TH>
                <TH />
              </THead>
              <tbody>
                {filtered.map((r) => (
                  <TR key={r.id}>
                    <TD className="text-white">{"★".repeat(Math.round(r.rating ?? 0))}<span className="text-white/20">{"★".repeat(5 - Math.round(r.rating ?? 0))}</span></TD>
                    <TD>
                      <p className="max-w-md text-white">{r.comment || "No comment."}</p>
                      <p className="text-xs">provider {r.providerId?.slice(0, 6)} · #{r.bookingId?.slice(0, 8)}</p>
                    </TD>
                    <TD>{fmtDate(toDate(r.createdAt))}</TD>
                    <TD><Badge tone={r.status === "approved" ? "success" : r.status === "rejected" ? "warning" : "muted"}>{titleCase(r.status ?? "pending")}</Badge></TD>
                    <TD>
                      <div className="flex justify-end gap-2">
                        {r.status !== "approved" ? <Button type="button" className="px-3 py-1.5 text-xs" onClick={() => decide(r.id, true)}>Approve</Button> : null}
                        {r.status !== "rejected" ? <Button type="button" variant="danger" className="px-3 py-1.5 text-xs" onClick={() => decide(r.id, false)}>Reject</Button> : null}
                      </div>
                    </TD>
                  </TR>
                ))}
              </tbody>
            </DataTable>
          );
        }}
      </AsyncView>
    </div>
  );
}
