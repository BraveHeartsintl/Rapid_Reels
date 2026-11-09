"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge, Card } from "@/components/ui/Card";
import { AsyncView, Notice } from "@/components/ui/State";
import { listAllReels, moderateReel } from "@/lib/data/queries";
import { errorMessage, titleCase } from "@/lib/format";
import { useAsync } from "@/lib/hooks";
import { cn } from "@/lib/utils";

type Filter = "pending_review" | "approved" | "rejected" | "all";

export function ReelModerationList({ initial }: { initial: Filter }) {
  const state = useAsync(() => listAllReels(300), []);
  const [filter, setFilter] = useState<Filter>(initial);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function act(id: string, action: "approve" | "reject") {
    setBusyId(id);
    setError(null);
    try {
      await moderateReel(id, action);
      state.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(["pending_review", "approved", "rejected", "all"] as Filter[]).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={cn("rounded-full px-3 py-1 text-xs", filter === f ? "bg-[var(--rr-primary)] text-white" : "bg-[var(--rr-card)] text-[var(--rr-text-tertiary)]")}>
            {f === "all" ? "All" : titleCase(f)}
          </button>
        ))}
      </div>
      {error ? <Notice>{error}</Notice> : null}
      <AsyncView state={state} empty="No reels yet.">
        {(rows) => {
          const filtered = rows.filter((r) => filter === "all" || (r.moderationStatus ?? "approved") === filter);
          if (filtered.length === 0) return <p className="text-sm text-[var(--rr-text-tertiary)]">No reels in this category.</p>;
          return (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((r) => {
                const status = r.moderationStatus ?? "approved";
                return (
                  <Card key={r.id} className="space-y-3 p-3">
                    {r.videoUrl ? (
                      <video src={r.videoUrl} poster={r.thumbnailUrl} controls preload="none" className="aspect-[9/16] max-h-80 w-full rounded-xl bg-black object-contain" />
                    ) : (
                      <div className="flex aspect-video items-center justify-center rounded-xl bg-white/5 text-xs text-[var(--rr-text-tertiary)]">No video</div>
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{r.title || r.eventName || "Reel"}</p>
                        <p className="text-xs text-[var(--rr-text-tertiary)]">{titleCase(r.eventType)} · provider {r.providerId?.slice(0, 6)}</p>
                      </div>
                      <Badge tone={status === "approved" ? "success" : status === "rejected" ? "warning" : "muted"}>{titleCase(status)}</Badge>
                    </div>
                    <div className="flex gap-2">
                      {status !== "approved" ? <Button type="button" className="flex-1 px-3 py-2 text-xs" disabled={busyId === r.id} onClick={() => act(r.id, "approve")}>Approve</Button> : null}
                      {status !== "rejected" ? <Button type="button" variant="danger" className="flex-1 px-3 py-2 text-xs" disabled={busyId === r.id} onClick={() => act(r.id, "reject")}>{status === "approved" ? "Take down" : "Reject"}</Button> : null}
                    </div>
                  </Card>
                );
              })}
            </div>
          );
        }}
      </AsyncView>
    </div>
  );
}
