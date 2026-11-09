"use client";

import Link from "next/link";
import { FlowScreen } from "@/components/layout/FlowScreen";
import { ReelTile } from "@/components/reel/ReelTile";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Card";
import { AsyncView } from "@/components/ui/State";
import { useUid } from "@/lib/auth/useUid";
import { listProviderReels } from "@/lib/data/queries";
import { titleCase } from "@/lib/format";
import { useAsync } from "@/lib/hooks";

export default function Page() {
  const uid = useUid();
  const state = useAsync(() => listProviderReels(uid!), [uid], Boolean(uid));

  return (
    <FlowScreen title="My reels" subtitle="Reels you have delivered" backHref="/provider-dashboard">
      <Button href="/provider-portfolio-upload" className="mb-4 w-full">Deliver a reel</Button>
      <AsyncView state={state} empty="You have not delivered any reels yet.">
        {(rows) => (
          <div className="grid grid-cols-2 gap-3">
            {rows.map((r) => (
              <div key={r.id}>
                <ReelTile reel={r} showStats />
                <div className="mt-2 flex items-center justify-between">
                  <Badge tone={r.moderationStatus === "approved" ? "success" : r.moderationStatus === "rejected" ? "warning" : "muted"}>
                    {r.isPublic ? "Public" : titleCase(r.moderationStatus ?? "pending_review")}
                  </Badge>
                  <Link href={`/reel-editor?id=${r.id}`} className="text-xs text-[var(--rr-secondary)]">Edit</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </AsyncView>
    </FlowScreen>
  );
}
