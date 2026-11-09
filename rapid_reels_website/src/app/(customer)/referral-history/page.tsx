"use client";

import { PageHeader } from "@/components/layout/FlowScreen";
import { Badge, Card } from "@/components/ui/Card";
import { AsyncView } from "@/components/ui/State";
import { useUid } from "@/lib/auth/useUid";
import { listReferrals } from "@/lib/data/queries";
import { fmtDate, fmtMoney, titleCase } from "@/lib/format";
import { useAsync } from "@/lib/hooks";

export default function Page() {
  const uid = useUid();
  const state = useAsync(() => listReferrals(uid!), [uid], Boolean(uid));

  return (
    <div>
      <PageHeader title="Referral history" />
      <AsyncView state={state} empty="No referrals yet. Share your code to get started.">
        {(rows) => (
          <div className="space-y-2">
            {rows.map((r) => (
              <Card key={r.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-white">Friend joined with {r.referralCode || "your code"}</p>
                  <p className="text-xs text-[var(--rr-text-tertiary)]">{fmtDate(r.createdAt)}</p>
                </div>
                <div className="text-right">
                  <Badge tone={r.status === "completed" ? "success" : "muted"}>{titleCase(r.status)}</Badge>
                  {r.status === "completed" ? (
                    <p className="mt-1 text-xs text-[var(--rr-success)]">+{fmtMoney(r.reward?.referrerReward, r.reward?.currency)}</p>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        )}
      </AsyncView>
    </div>
  );
}
