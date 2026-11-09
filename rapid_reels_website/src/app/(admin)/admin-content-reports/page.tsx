"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Badge, Card } from "@/components/ui/Card";
import { AsyncView, Notice } from "@/components/ui/State";
import { listContentReports, moderateReel, resolveContentReport } from "@/lib/data/queries";
import { toDate } from "@/lib/data/types";
import { errorMessage, fmtDate, titleCase } from "@/lib/format";
import { useAsync } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const FILTERS = ["pending", "resolved", "dismissed", "all"] as const;

export default function Page() {
  const state = useAsync(listContentReports, []);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("pending");
  const [error, setError] = useState<string | null>(null);

  async function act(id: string, status: "resolved" | "dismissed", reelId?: string) {
    setError(null);
    const note = window.prompt(status === "resolved" ? "Resolution note (optional)" : "Why is this report dismissed? (optional)") ?? undefined;
    try {
      if (reelId) await moderateReel(reelId, "reject");
      await resolveContentReport(id, status, note);
      state.reload();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <div>
      <PageHeader title="Content reports" subtitle="Reports submitted by users" />
      <div className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={cn("rounded-full px-3 py-1 text-xs capitalize", filter === f ? "bg-[var(--rr-primary)] text-white" : "bg-[var(--rr-card)] text-[var(--rr-text-tertiary)]")}>{f}</button>
        ))}
      </div>
      {error ? <Notice>{error}</Notice> : null}
      <AsyncView state={state} empty="No reports.">
        {(rows) => {
          const filtered = rows.filter((r) => filter === "all" || (r.status ?? "pending") === filter);
          if (filtered.length === 0) return <p className="text-sm text-[var(--rr-text-tertiary)]">Nothing in this category.</p>;
          return (
            <div className="space-y-2">
              {filtered.map((r) => (
                <Card key={r.id} className="space-y-2 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{titleCase(r.reason)}</p>
                    <Badge tone={r.status === "resolved" ? "success" : r.status === "dismissed" ? "muted" : "warning"}>{titleCase(r.status ?? "pending")}</Badge>
                  </div>
                  {r.details ? <p className="text-[var(--rr-text-secondary)]">{r.details}</p> : null}
                  <p className="text-xs text-[var(--rr-text-tertiary)]">
                    {titleCase(r.reportType ?? "reel")} · {fmtDate(toDate(r.createdAt))}
                    {r.reelId ? ` · reel ${r.reelId.slice(0, 8)}` : ""}
                  </p>
                  {r.adminNote ? <p className="text-xs text-[var(--rr-text-tertiary)]">Note: {r.adminNote}</p> : null}
                  {(r.status ?? "pending") === "pending" ? (
                    <div className="flex flex-wrap gap-2">
                      {r.reelId ? <Button type="button" variant="danger" className="px-3 py-1.5 text-xs" onClick={() => act(r.id, "resolved", r.reelId)}>Remove reel &amp; resolve</Button> : null}
                      <Button type="button" className="px-3 py-1.5 text-xs" onClick={() => act(r.id, "resolved")}>Mark resolved</Button>
                      <Button type="button" variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => act(r.id, "dismissed")}>Dismiss</Button>
                    </div>
                  ) : null}
                </Card>
              ))}
            </div>
          );
        }}
      </AsyncView>
    </div>
  );
}
