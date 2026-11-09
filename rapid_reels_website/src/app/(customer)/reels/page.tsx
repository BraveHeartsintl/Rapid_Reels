"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/FlowScreen";
import { Badge, Card } from "@/components/ui/Card";
import { AsyncView } from "@/components/ui/State";
import { useUid } from "@/lib/auth/useUid";
import { listCustomerReels } from "@/lib/data/queries";
import { fmtDate, titleCase } from "@/lib/format";
import { useAsync } from "@/lib/hooks";

export default function MyReelsPage() {
  const uid = useUid();
  const state = useAsync(() => listCustomerReels(uid!), [uid], Boolean(uid));

  return (
    <div>
      <PageHeader title="My Reels" subtitle="Delivered from your bookings" />
      <AsyncView state={state} empty="No reels yet. They appear here once your provider delivers them.">
        {(reels) => (
          <div>
            {reels.map((r) => (
              <Link key={r.id} href={`/reel-player?id=${r.id}`}>
                <Card className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{r.title || r.eventName || "Reel"}</p>
                    <p className="text-xs text-[var(--rr-text-tertiary)]">
                      {titleCase(r.eventType)} · {fmtDate(r.createdAt)}
                    </p>
                    <div className="mt-1">
                      <Badge tone={r.isPublic ? "success" : "muted"}>{r.isPublic ? "Public" : titleCase(r.status)}</Badge>
                    </div>
                  </div>
                  <span className="text-[var(--rr-secondary)]">Play →</span>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </AsyncView>
    </div>
  );
}
