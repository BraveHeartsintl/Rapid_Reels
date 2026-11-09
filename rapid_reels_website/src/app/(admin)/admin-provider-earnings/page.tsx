"use client";

import { PageHeader } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";
import { AsyncView } from "@/components/ui/State";
import { listAllPayments, listAllProviders } from "@/lib/data/queries";
import { fmtMoney } from "@/lib/format";
import { useAsync } from "@/lib/hooks";

export default function Page() {
  const state = useAsync(async () => {
    const [providers, payments] = await Promise.all([listAllProviders(), listAllPayments(1000)]);
    return { providers, payments };
  }, []);

  return (
    <div>
      <PageHeader title="Provider earnings" subtitle="Succeeded payments grouped by provider, with the platform commission" />
      <AsyncView state={state} isEmpty={(d) => d.providers.length === 0} empty="No providers yet.">
        {({ providers, payments }) => {
          const gross = new Map<string, { total: number; count: number }>();
          for (const p of payments) {
            if (p.status !== "succeeded" || !p.providerUserId) continue;
            const cur = gross.get(p.providerUserId) ?? { total: 0, count: 0 };
            gross.set(p.providerUserId, { total: cur.total + (p.amount ?? 0), count: cur.count + 1 });
          }
          const rows = providers
            .map((p) => {
              const g = gross.get(p.id) ?? { total: 0, count: 0 };
              const rate = p.commissionRate ?? 15;
              return { p, ...g, commission: (g.total * rate) / 100, rate, payout: g.total - (g.total * rate) / 100 };
            })
            .sort((a, b) => b.total - a.total);
          const totalGross = rows.reduce((s, r) => s + r.total, 0);
          const totalCommission = rows.reduce((s, r) => s + r.commission, 0);
          return (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <Card><p className="text-xs text-[var(--rr-text-tertiary)]">Gross volume</p><p className="text-2xl font-bold text-white">{fmtMoney(totalGross)}</p></Card>
                <Card><p className="text-xs text-[var(--rr-text-tertiary)]">Platform commission</p><p className="text-2xl font-bold text-white">{fmtMoney(totalCommission)}</p></Card>
                <Card><p className="text-xs text-[var(--rr-text-tertiary)]">Provider payouts</p><p className="text-2xl font-bold text-white">{fmtMoney(totalGross - totalCommission)}</p></Card>
              </div>
              <div className="space-y-2">
                {rows.map((r) => (
                  <Card key={r.p.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                    <div>
                      <p className="font-medium text-white">{r.p.businessName || r.p.id}</p>
                      <p className="text-xs text-[var(--rr-text-tertiary)]">{r.count} payments · commission {r.rate}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white">{fmtMoney(r.payout)}</p>
                      <p className="text-xs text-[var(--rr-text-tertiary)]">of {fmtMoney(r.total)} gross</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        }}
      </AsyncView>
    </div>
  );
}
