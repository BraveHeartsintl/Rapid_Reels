"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Card";
import { DataTable, TD, TH, THead, TR } from "@/components/ui/DataTable";
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
            <DataTable>
              <THead>
                <TH>Preview</TH>
                <TH>Reel</TH>
                <TH>Status</TH>
                <TH />
              </THead>
              <tbody>
                {filtered.map((r) => {
                  const status = r.moderationStatus ?? "approved";
                  return (
                    <TR key={r.id}>
                      <TD>
                        {r.videoUrl ? (
                          <video src={r.videoUrl} poster={r.thumbnailUrl} controls preload="none" className="h-28 w-16 rounded-lg bg-black object-cover" />
                        ) : (
                          <div className="flex h-28 w-16 items-center justify-center rounded-lg bg-white/5 text-[10px] text-[var(--rr-text-tertiary)]">None</div>
                        )}
                      </TD>
                      <TD>
                        <p className="font-medium text-white">{r.title || r.eventName || "Reel"}</p>
                        <p className="text-xs">{titleCase(r.eventType)} · provider {r.providerId?.slice(0, 6)}</p>
                      </TD>
                      <TD><Badge tone={status === "approved" ? "success" : status === "rejected" ? "warning" : "muted"}>{titleCase(status)}</Badge></TD>
                      <TD>
                        <div className="flex justify-end gap-2">
                          {status !== "approved" ? <Button type="button" className="px-3 py-2 text-xs" disabled={busyId === r.id} onClick={() => act(r.id, "approve")}>Approve</Button> : null}
                          {status !== "rejected" ? <Button type="button" variant="danger" className="px-3 py-2 text-xs" disabled={busyId === r.id} onClick={() => act(r.id, "reject")}>{status === "approved" ? "Take down" : "Reject"}</Button> : null}
                        </div>
                      </TD>
                    </TR>
                  );
                })}
              </tbody>
            </DataTable>
          );
        }}
      </AsyncView>
    </div>
  );
}
