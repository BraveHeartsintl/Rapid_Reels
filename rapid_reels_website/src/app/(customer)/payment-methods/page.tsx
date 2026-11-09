"use client";

import { PageHeader } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";
import { AsyncView } from "@/components/ui/State";
import { useUid } from "@/lib/auth/useUid";
import { listCustomerPayments } from "@/lib/data/queries";
import { fmtDate, titleCase } from "@/lib/format";
import { useAsync } from "@/lib/hooks";

export default function Page() {
  const uid = useUid();
  const state = useAsync(
    async () => {
      const payments = await listCustomerPayments(uid!);
      const byMethod = new Map<string, { count: number; last: unknown }>();
      payments.forEach((p) => {
        const key = p.paymentMethodType || "stripe";
        const cur = byMethod.get(key);
        byMethod.set(key, { count: (cur?.count ?? 0) + 1, last: cur?.last ?? p.createdAt });
      });
      return [...byMethod.entries()].map(([method, v]) => ({ method, ...v }));
    },
    [uid],
    Boolean(uid),
  );

  return (
    <div>
      <PageHeader title="Payment methods" subtitle="Cards are entered securely at checkout" />
      <p className="mb-4 text-sm text-[var(--rr-text-tertiary)]">
        Rapid Reels never stores your card details. You pay through Stripe when you confirm a booking.
      </p>
      <AsyncView state={state} empty="You have not used any payment method yet.">
        {(rows) => (
          <div className="space-y-3">
            {rows.map((r) => (
              <Card key={r.method} className="flex justify-between text-sm text-white">
                <span>{titleCase(r.method)}</span>
                <span className="text-xs text-[var(--rr-text-tertiary)]">
                  {r.count} payment{r.count === 1 ? "" : "s"} · last {fmtDate(r.last)}
                </span>
              </Card>
            ))}
          </div>
        )}
      </AsyncView>
    </div>
  );
}
