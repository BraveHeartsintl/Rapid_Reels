"use client";

import { BookingCard } from "@/components/booking/BookingCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AsyncView } from "@/components/ui/State";
import { useProviderDoc } from "@/lib/auth/useProviderDoc";
import { listProviderBookings, listProviderPayments } from "@/lib/data/queries";
import { toDate } from "@/lib/data/types";
import { fmtMoney } from "@/lib/format";
import { useAsync } from "@/lib/hooks";

export default function Page() {
  const { uid, data: provider } = useProviderDoc();
  const bookings = useAsync(() => listProviderBookings(uid!), [uid], Boolean(uid));
  const payments = useAsync(() => listProviderPayments(uid!), [uid], Boolean(uid));

  const now = new Date();
  const monthTotal =
    payments.data
      ?.filter((p) => {
        const d = toDate(p.createdAt);
        return p.status === "succeeded" && d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, p) => s + (p.amount ?? 0), 0) ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">{provider?.businessName ?? "Today"}</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-[var(--rr-text-tertiary)]">Pending requests</p>
          <p className="mt-2 text-2xl font-bold text-white">{bookings.data?.filter((b) => b.status === "pending").length ?? "–"}</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--rr-text-tertiary)]">Month earnings</p>
          <p className="mt-2 text-2xl font-bold text-white">{payments.data ? fmtMoney(monthTotal) : "–"}</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--rr-text-tertiary)]">Quick actions</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button href="/live-event-mode" className="px-3 py-2 text-xs">Live mode</Button>
            <Button href="/provider-catalogue" variant="outline" className="px-3 py-2 text-xs">Catalogue</Button>
          </div>
        </Card>
      </div>
      <h2 className="mb-3 mt-8 text-sm font-semibold text-[var(--rr-text-secondary)]">Upcoming</h2>
      <AsyncView state={bookings} empty="No bookings yet.">
        {(rows) => {
          const active = rows.filter((b) => ["pending", "confirmed", "ongoing"].includes(b.status ?? "")).slice(0, 5);
          return active.length === 0 ? (
            <Card className="text-sm text-[var(--rr-text-tertiary)]">No active bookings.</Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {active.map((b) => (
                <BookingCard key={b.id} booking={b} href={`/provider-booking-status?id=${b.id}`} />
              ))}
            </div>
          );
        }}
      </AsyncView>
    </div>
  );
}
