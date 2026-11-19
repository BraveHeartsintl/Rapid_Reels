"use client";

import { Badge, Card } from "@/components/ui/Card";
import { DataTable, TD, TH, THead, TR } from "@/components/ui/DataTable";
import { AsyncView } from "@/components/ui/State";
import { useUid } from "@/lib/auth/useUid";
import { listProviderPayments } from "@/lib/data/queries";
import { toDate } from "@/lib/data/types";
import { fmtDate, fmtMoney, titleCase } from "@/lib/format";
import { useAsync } from "@/lib/hooks";

const MONTH = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" });

export function EarningsView() {
  const uid = useUid();
  const state = useAsync(() => listProviderPayments(uid!), [uid], Boolean(uid));

  return (
    <AsyncView state={state} empty="No payments yet. Earnings appear once customers pay for bookings.">
      {(rows) => {
        const paid = rows.filter((r) => r.status === "completed" || r.status === "succeeded" || r.status === "paid");
        const total = paid.reduce((s, r) => s + (r.amount ?? 0), 0);
        const now = new Date();
        const thisMonth = paid
          .filter((r) => {
            const d = toDate(r.createdAt);
            return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          })
          .reduce((s, r) => s + (r.amount ?? 0), 0);
        const pending = rows.filter((r) => r.status === "pending" || r.status === "processing").reduce((s, r) => s + (r.amount ?? 0), 0);
        const currency = rows[0]?.currency;

        const byMonth = new Map<string, number>();
        for (const r of paid) {
          const d = toDate(r.createdAt);
          if (!d) continue;
          const key = MONTH.format(d);
          byMonth.set(key, (byMonth.get(key) ?? 0) + (r.amount ?? 0));
        }

        return (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card><p className="text-3xl font-bold text-white">{fmtMoney(total, currency)}</p><p className="mt-1 text-sm text-[var(--rr-text-tertiary)]">Total received</p></Card>
              <Card><p className="text-3xl font-bold text-white">{fmtMoney(thisMonth, currency)}</p><p className="mt-1 text-sm text-[var(--rr-text-tertiary)]">This month</p></Card>
              <Card><p className="text-3xl font-bold text-white">{fmtMoney(pending, currency)}</p><p className="mt-1 text-sm text-[var(--rr-text-tertiary)]">Pending</p></Card>
            </div>
            {byMonth.size > 0 ? (
              <section>
                <h2 className="mb-2 text-sm font-semibold text-[var(--rr-text-secondary)]">By month</h2>
                <div className="space-y-2">
                  {[...byMonth.entries()].map(([m, amt]) => (
                    <div key={m} className="flex justify-between rounded-2xl bg-[var(--rr-card)] px-4 py-3 text-sm">
                      <span className="text-white">{m}</span>
                      <span className="text-[var(--rr-text-secondary)]">{fmtMoney(amt, currency)}</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
            <section>
              <h2 className="mb-2 text-sm font-semibold text-[var(--rr-text-secondary)]">Transactions</h2>
              <DataTable>
                <THead>
                  <TH>Amount</TH>
                  <TH>Date</TH>
                  <TH>Status</TH>
                </THead>
                <tbody>
                  {rows.map((r) => (
                    <TR key={r.id}>
                      <TD className="font-medium text-white">{fmtMoney(r.amount, r.currency)}</TD>
                      <TD>{fmtDate(toDate(r.createdAt))}</TD>
                      <TD>
                        <Badge tone={r.status === "completed" || r.status === "succeeded" ? "success" : "muted"}>{titleCase(r.status)}</Badge>
                      </TD>
                    </TR>
                  ))}
                </tbody>
              </DataTable>
            </section>
          </div>
        );
      }}
    </AsyncView>
  );
}
