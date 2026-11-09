"use client";

import { BookingCard } from "@/components/booking/BookingCard";
import { AsyncView } from "@/components/ui/State";
import { useUid } from "@/lib/auth/useUid";
import { listProviderBookings } from "@/lib/data/queries";
import { useAsync } from "@/lib/hooks";

/** Lists the provider's bookings so they can pick one for a booking-scoped screen. */
export function BookingPicker({
  hrefFor,
  statuses,
  empty = "No bookings available.",
}: {
  hrefFor: (bookingId: string) => string;
  statuses?: string[];
  empty?: string;
}) {
  const uid = useUid();
  const state = useAsync(() => listProviderBookings(uid!), [uid], Boolean(uid));
  return (
    <AsyncView state={state} empty={empty}>
      {(rows) => {
        const filtered = statuses ? rows.filter((b) => statuses.includes(b.status ?? "")) : rows;
        return filtered.length === 0 ? (
          <p className="text-sm text-[var(--rr-text-tertiary)]">{empty}</p>
        ) : (
          <div>
            <p className="mb-3 text-sm text-[var(--rr-text-secondary)]">Select a booking</p>
            {filtered.map((b) => (
              <BookingCard key={b.id} booking={b} href={hrefFor(b.id)} />
            ))}
          </div>
        );
      }}
    </AsyncView>
  );
}
