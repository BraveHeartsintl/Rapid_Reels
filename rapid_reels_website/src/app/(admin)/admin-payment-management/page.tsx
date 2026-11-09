"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/FlowScreen";
import { Badge, Card } from "@/components/ui/Card";
import { AsyncView } from "@/components/ui/State";
import { listAllPayments } from "@/lib/data/queries";
import { toDate } from "@/lib/data/types";
import { fmtDateTime, fmtMoney, titleCase } from "@/lib/format";
import { useAsync } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export default function Page() {
  const state = useAsync(() => listAllPayments(500), []);
  const [filter, setFilter] = useState("all");

  return (
    <div>
      <PageHeader title="Payment management" subtitle="Stripe transactions recorded by the platform" />
      <AsyncView state={state} empty="No payments yet.">
        {(rows) => {
          const statuses = ["all", ...Array.from(new Set(rows.map((r) => r.status ?? "unknown")))];
          const filtered = rows.filter((r) => filter === "all" || r.status === filter);
          const total = rows.filter((r) => r.status === "succeeded").reduce((s, r) => s + (r.amount ?? 0), 0);
          return (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <Card><p className="text-xs text-[var(--rr-text-tertiary)]">Succeeded volume</p><p className="text-2xl font-bold text-white">{fmtMoney(total)}</p></Card>
                <Card><p className="text-xs text-[var(--rr-text-tertiary)]">Transactions</p><p className="text-2xl font-bold text-white">{rows.length}</p></Card>
                <Card><p className="text-xs text-[var(--rr-text-tertiary)]">Failed</p><p className="text-2xl font-bold text-white">{rows.filter((r) => r.status === "failed").length}</p></Card>
              </div>
              <div className="flex flex-wrap gap-2">
                {statuses.map((s) => (
                  <button key={s} type="button" onClick={() => setFilter(s)} className={cn("rounded-full px-3 py-1 text-xs capitalize", filter === s ? "bg-[var(--rr-primary)] text-white" : "bg-[var(--rr-card)] text-[var(--rr-text-tertiary)]")}>{s}</button>
                ))}
              </div>
              <div className="space-y-2">
                {filtered.map((r) => (
                  <Card key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                    <div>
                      <p className="font-medium text-white">{fmtMoney(r.amount, r.currency)}</p>
                      <p className="text-xs text-[var(--rr-text-tertiary)]">
                        {fmtDateTime(toDate(r.createdAt))} · booking #{r.bookingId?.slice(0, 8)} · {titleCase(r.paymentMethodType)}
                      </p>
                      <p className="text-xs text-[var(--rr-text-tertiary)]">{r.id}</p>
                    </div>
                    <Badge tone={r.status === "succeeded" ? "success" : r.status === "failed" ? "warning" : "muted"}>{titleCase(r.status)}</Badge>
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
