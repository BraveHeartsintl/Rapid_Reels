"use client";

import { FlowScreen } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";
import { AsyncView, Empty } from "@/components/ui/State";
import { getBooking } from "@/lib/data/queries";
import { fmtDate } from "@/lib/format";
import { useAsync, useQuery } from "@/lib/hooks";

export default function Page() {
  const query = useQuery();
  const id = query.get("id");
  const state = useAsync(() => getBooking(id!), [id], query.ready && Boolean(id));

  return (
    <FlowScreen title="Venue navigation" subtitle="Plan your route to the event" backHref={id ? `/provider-booking-status?id=${id}` : "/provider-bookings"}>
      {query.ready && !id ? (
        <Empty>No booking selected. <a href="/provider-bookings" className="underline">All bookings</a></Empty>
      ) : (
        <AsyncView state={state} empty="Booking not found." isEmpty={(d) => d === null}>
          {(b) => {
            if (!b) return null;
            const v = b.venue ?? {};
            const address = [v.name, v.address, v.city, v.pincode].filter(Boolean).join(", ");
            const c = v.coordinates;
            const dest = c?.latitude && c?.longitude ? `${c.latitude},${c.longitude}` : address;
            return (
              <div className="space-y-3">
                <Card>
                  <p className="text-sm text-[var(--rr-text-secondary)]">{b.eventName} · {fmtDate(b.eventDate)} {b.eventTime}</p>
                  <p className="mt-2 text-lg font-medium text-white">{v.name || "Venue"}</p>
                  <p className="text-sm text-[var(--rr-text-tertiary)]">{[v.address, v.city, v.pincode].filter(Boolean).join(", ")}</p>
                </Card>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl bg-[var(--rr-primary)] px-6 py-3 text-center text-sm font-semibold text-white"
                >
                  Get directions
                </a>
              </div>
            );
          }}
        </AsyncView>
      )}
    </FlowScreen>
  );
}
