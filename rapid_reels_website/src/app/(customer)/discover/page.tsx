"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/FlowScreen";
import { ReelTile } from "@/components/reel/ReelTile";
import { AsyncView } from "@/components/ui/State";
import { listDiscoverReels } from "@/lib/data/queries";
import { EVENT_TYPES } from "@/lib/format";
import { useAsync } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export default function DiscoverPage() {
  const [type, setType] = useState<string | undefined>(undefined);
  const state = useAsync(() => listDiscoverReels(40, type), [type]);

  const chip = (id: string | undefined, label: string) => (
    <button
      key={label}
      type="button"
      onClick={() => setType(id)}
      className={cn(
        "shrink-0 rounded-full px-3 py-1 text-xs font-medium",
        type === id ? "bg-[var(--rr-primary)] text-white" : "bg-white/5 text-[var(--rr-text-tertiary)]",
      )}
    >
      {label}
    </button>
  );

  return (
    <div>
      <PageHeader title="Discover" subtitle="Trending event reels" />
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {chip(undefined, "All")}
        {EVENT_TYPES.map((e) => chip(e.id, e.label))}
      </div>
      <AsyncView state={state} empty="No reels have been published for this category yet.">
        {(reels) => (
          <div className="grid grid-cols-2 gap-3">
            {reels.map((r) => (
              <ReelTile key={r.id} reel={r} href={`/reel-player?id=${r.id}`} showStats />
            ))}
          </div>
        )}
      </AsyncView>
    </div>
  );
}
