"use client";

import { BookingCard } from "@/components/booking/BookingCard";
import { Button } from "@/components/ui/Button";
import { AsyncView } from "@/components/ui/State";
import { useUid } from "@/lib/auth/useUid";
import { listProviderBookings } from "@/lib/data/queries";
import { toDate } from "@/lib/data/types";
import { fmtDate } from "@/lib/format";
import { useAsync } from "@/lib/hooks";

export default function Page() {
  const uid = useUid();
  const state = useAsync(() => listProviderBookings(uid!), [uid], Boolean(uid));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Schedule</h1>
        <div className="flex gap-2">
          <Button href="/provider-booking-calendar" variant="outline" className="px-3 py-2 text-xs">Calendar</Button>
          <Button href="/provider-availability-calendar" variant="outline" className="px-3 py-2 text-xs">Availability</Button>
        </div>
      </div>
      <AsyncView state={state} empty="Nothing scheduled.">
        {(rows) => {
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          const upcoming = rows
            .filter((b) => b.status !== "cancelled" && (toDate(b.eventDate)?.getTime() ?? 0) >= startOfToday.getTime())
            .sort((a, b) => (toDate(a.eventDate)?.getTime() ?? 0) - (toDate(b.eventDate)?.getTime() ?? 0));
          if (upcoming.length === 0) return <p className="text-sm text-[var(--rr-text-tertiary)]">No upcoming events.</p>;
          const groups = new Map<string, typeof upcoming>();
          for (const b of upcoming) {
            const k = fmtDate(toDate(b.eventDate));
            groups.set(k, [...(groups.get(k) ?? []), b]);
          }
          return (
            <div className="space-y-5">
              {[...groups.entries()].map(([day, items]) => (
                <section key={day}>
                  <h2 className="mb-2 text-sm font-semibold text-[var(--rr-text-secondary)]">{day}</h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {items.map((b) => (
                      <BookingCard key={b.id} booking={b} href={`/provider-booking-status?id=${b.id}`} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          );
        }}
      </AsyncView>
    </div>
  );
}
