"use client";

import { useEffect } from "react";
import { PageHeader } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AsyncView } from "@/components/ui/State";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useUid } from "@/lib/auth/useUid";
import { listWalletTransactions } from "@/lib/data/queries";
import { fmtDate, fmtMoney, titleCase } from "@/lib/format";
import { useAsync } from "@/lib/hooks";

const DEBIT_TYPES = ["debit", "payment", "withdrawal", "spend", "booking_payment", "redeem"];

export default function Page() {
  const { profile, refreshProfile } = useAuth();
  const uid = useUid();
  const state = useAsync(() => listWalletTransactions(uid!), [uid], Boolean(uid));

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  return (
    <div>
      <PageHeader title="Wallet" subtitle="Balance and history" />
      <Card className="mb-6">
        <p className="text-sm text-[var(--rr-text-secondary)]">Available</p>
        <p className="text-3xl font-bold text-white">{fmtMoney(profile?.walletBalance ?? 0)}</p>
        <Button href="/redemption" className="mt-4" variant="outline">Redeem offers</Button>
      </Card>
      <h2 className="mb-3 text-sm font-semibold text-[var(--rr-text-secondary)]">Recent</h2>
      <AsyncView state={state} empty="No wallet activity yet.">
        {(rows) => (
          <div>
            {rows.map((t) => {
              const credit = !DEBIT_TYPES.includes(t.type ?? "");
              return (
                <Card key={t.id} className="mb-2 flex justify-between text-sm">
                  <div>
                    <p className="text-white">{t.description || titleCase(t.type)}</p>
                    <p className="text-xs text-[var(--rr-text-tertiary)]">
                      {fmtDate(t.createdAt)} · {titleCase(t.status)}
                    </p>
                  </div>
                  <span className={credit ? "text-[var(--rr-success)]" : "text-white"}>
                    {credit ? "+" : "−"}
                    {fmtMoney(Math.abs(t.amount ?? 0), t.currency)}
                  </span>
                </Card>
              );
            })}
          </div>
        )}
      </AsyncView>
    </div>
  );
}
