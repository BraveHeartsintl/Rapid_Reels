"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/State";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useUid } from "@/lib/auth/useUid";
import { listReferrals } from "@/lib/data/queries";
import { fmtMoney } from "@/lib/format";
import { useAsync } from "@/lib/hooks";

export default function Page() {
  const { profile } = useAuth();
  const uid = useUid();
  const referrals = useAsync(() => listReferrals(uid!), [uid], Boolean(uid));
  const [msg, setMsg] = useState<string | null>(null);
  const code = profile?.referralCode ?? "";

  const rows = referrals.data ?? [];
  const completed = rows.filter((r) => r.status === "completed");
  const earned = completed.reduce((sum, r) => sum + (r.reward?.referrerReward ?? 0), 0);
  const message = `Join me on Rapid Reels and book event creators! Use my code ${code} when you sign up.`;

  async function share() {
    if (navigator.share) {
      await navigator.share({ title: "Rapid Reels", text: message }).catch(() => undefined);
    } else {
      await navigator.clipboard.writeText(message);
      setMsg("Invite message copied to clipboard.");
    }
  }

  return (
    <div>
      <PageHeader title="Referrals" subtitle="Invite friends, earn wallet credit" />
      <Card className="mb-4 text-center">
        <p className="text-sm text-[var(--rr-text-secondary)]">Your code</p>
        <p className="mt-2 text-2xl font-bold text-[var(--rr-secondary)]">{code || "—"}</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button type="button" onClick={share} disabled={!code}>Invite friends</Button>
          <Button href="/referral-history" variant="outline">View history</Button>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center">
          <p className="text-2xl font-semibold text-white">{referrals.loading ? "…" : rows.length}</p>
          <p className="text-xs text-[var(--rr-text-tertiary)]">Invited</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-semibold text-white">{referrals.loading ? "…" : fmtMoney(earned)}</p>
          <p className="text-xs text-[var(--rr-text-tertiary)]">Earned ({completed.length} completed)</p>
        </Card>
      </div>
      {msg ? <div className="mt-3"><Notice tone="success">{msg}</Notice></div> : null}
      {referrals.error ? <div className="mt-3"><Notice>{referrals.error}</Notice></div> : null}
    </div>
  );
}
