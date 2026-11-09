"use client";

import { useState } from "react";
import { BookingCard } from "@/components/booking/BookingCard";
import { AsyncView } from "@/components/ui/State";
import { useUid } from "@/lib/auth/useUid";
import { listProviderBookings } from "@/lib/data/queries";
import { useAsync } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const FILTERS = ["all", "pending", "confirmed", "ongoing", "completed", "cancelled"] as const;

export function ProviderBookingList() {
  const uid = useUid();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const state = useAsync(() => listProviderBookings(uid!), [uid], Boolean(uid));

  return (
    <div>
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs capitalize",
              filter === f ? "bg-[var(--rr-primary)] text-white" : "bg-[var(--rr-card)] text-[var(--rr-text-tertiary)]",
            )}
          >
            {f}
          </button>
        ))}
      </div>
      <AsyncView state={state} empty="You have no bookings yet.">
        {(rows) => {
          const filtered = rows.filter((b) => filter === "all" || b.status === filter);
          return filtered.length === 0 ? (
            <p className="text-sm text-[var(--rr-text-tertiary)]">No bookings in this category.</p>
          ) : (
            <div>
              {filtered.map((b) => (
                <BookingCard key={b.id} booking={b} href={`/provider-booking-status?id=${b.id}`} />
              ))}
            </div>
          );
        }}
      </AsyncView>
    </div>
  );
}
