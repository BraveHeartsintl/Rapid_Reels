"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/FlowScreen";
import { BookingCard } from "@/components/booking/BookingCard";
import { AsyncView } from "@/components/ui/State";
import { useUid } from "@/lib/auth/useUid";
import { listCustomerBookings } from "@/lib/data/queries";
import { useAsync } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "all", label: "All", match: () => true },
  { id: "upcoming", label: "Upcoming", match: (s?: string) => s === "pending" || s === "confirmed" },
  { id: "ongoing", label: "Ongoing", match: (s?: string) => s === "ongoing" },
  { id: "completed", label: "Completed", match: (s?: string) => s === "completed" },
  { id: "cancelled", label: "Cancelled", match: (s?: string) => s === "cancelled" },
];

export default function MyEventsPage() {
  const uid = useUid();
  const [filter, setFilter] = useState("all");
  const state = useAsync(() => listCustomerBookings(uid!), [uid], Boolean(uid));
  const active = FILTERS.find((f) => f.id === filter) ?? FILTERS[0];

  return (
    <div>
      <PageHeader title="My Events" subtitle="Track bookings end to end" />
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs",
              filter === f.id ? "bg-[var(--rr-primary)] text-white" : "bg-[var(--rr-card)] text-[var(--rr-text-tertiary)]",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <AsyncView state={state} empty="You have no bookings yet.">
        {(rows) => {
          const filtered = rows.filter((b) => active.match(b.status));
          return filtered.length === 0 ? (
            <p className="text-sm text-[var(--rr-text-tertiary)]">No events in this category.</p>
          ) : (
            <div>
              {filtered.map((b) => (
                <BookingCard key={b.id} booking={b} href={`/event-details-view?id=${b.id}`} />
              ))}
            </div>
          );
        }}
      </AsyncView>
    </div>
  );
}
