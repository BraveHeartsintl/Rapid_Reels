"use client";

import { PageHeader } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";
import { AsyncView } from "@/components/ui/State";
import { listAllBookings, listAllPayments } from "@/lib/data/queries";
import { toDate } from "@/lib/data/types";
import { fmtMoney, titleCase } from "@/lib/format";
import { useAsync } from "@/lib/hooks";

function Bars({ rows }: { rows: Array<[string, number]> }) {
  const max = Math.max(1, ...rows.map(([, v]) => v));
  return (
    <div className="space-y-2">
      {rows.map(([label, v]) => (
        <div key={label} className="text-xs">
          <div className="mb-1 flex justify-between text-[var(--rr-text-secondary)]">
            <span>{label}</span>
            <span className="text-white">{v}</span>
          </div>
          <div className="h-2 rounded-full bg-white/5">
            <div className="h-2 rounded-full bg-[var(--rr-primary)]" style={{ width: `${(v / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const count = (items: string[]) => {
  const m = new Map<string, number>();
  for (const i of items) m.set(i, (m.get(i) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

export default function Page() {
  const state = useAsync(async () => {
    const [bookings, payments] = await Promise.all([listAllBookings(1000), listAllPayments(1000)]);
    return { bookings, payments, weekAgo: Date.now() - 7 * 86400_000 };
  }, []);

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Based on the most recent 1,000 bookings and payments" />
      <AsyncView state={state} isEmpty={() => false}>
        {({ bookings, payments, weekAgo }) => {
          const lastWeek = bookings.filter((b) => (toDate(b.createdAt)?.getTime() ?? 0) >= weekAgo).length;
          const succeeded = payments.filter((p) => p.status === "succeeded");
          const revenue = succeeded.reduce((s, p) => s + (p.amount ?? 0), 0);
          const completed = bookings.filter((b) => b.status === "completed").length;
          const avg = succeeded.length ? revenue / succeeded.length : 0;

          const month = new Intl.DateTimeFormat("en-GB", { month: "short", year: "2-digit" });
          const byMonth = new Map<string, number>();
          for (const p of [...succeeded].reverse()) {
            const d = toDate(p.createdAt);
            if (!d) continue;
            const k = month.format(d);
            byMonth.set(k, (byMonth.get(k) ?? 0) + (p.amount ?? 0));
          }
          return (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-4">
                <Card><p className="text-xs text-[var(--rr-text-tertiary)]">Bookings (7 days)</p><p className="text-2xl font-bold text-white">{lastWeek}</p></Card>
                <Card><p className="text-xs text-[var(--rr-text-tertiary)]">Completed events</p><p className="text-2xl font-bold text-white">{completed}</p></Card>
                <Card><p className="text-xs text-[var(--rr-text-tertiary)]">Revenue</p><p className="text-2xl font-bold text-white">{fmtMoney(revenue)}</p></Card>
                <Card><p className="text-xs text-[var(--rr-text-tertiary)]">Avg payment</p><p className="text-2xl font-bold text-white">{fmtMoney(avg)}</p></Card>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                <Card><h2 className="mb-3 text-sm font-semibold text-white">Bookings by status</h2><Bars rows={count(bookings.map((b) => titleCase(b.status)))} /></Card>
                <Card><h2 className="mb-3 text-sm font-semibold text-white">Bookings by event type</h2><Bars rows={count(bookings.map((b) => titleCase(b.eventType)))} /></Card>
                <Card><h2 className="mb-3 text-sm font-semibold text-white">Revenue by month (£)</h2><Bars rows={[...byMonth.entries()].map(([k, v]) => [k, Math.round(v)] as [string, number])} /></Card>
              </div>
            </div>
          );
        }}
      </AsyncView>
    </div>
  );
}
