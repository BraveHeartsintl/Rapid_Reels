"use client";

import { FlowScreen } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AsyncView, Empty } from "@/components/ui/State";
import { getBooking } from "@/lib/data/queries";
import { useAsync, useQuery } from "@/lib/hooks";

export default function Page() {
  const query = useQuery();
  const id = query.get("id");
  const state = useAsync(() => getBooking(id!), [id], query.ready && Boolean(id));

  return (
    <FlowScreen title="Customer contact" subtitle="Reach the person behind the booking" backHref={id ? `/provider-booking-status?id=${id}` : "/provider-bookings"}>
      {query.ready && !id ? (
        <Empty>No booking selected. <a href="/provider-bookings" className="underline">All bookings</a></Empty>
      ) : (
        <AsyncView state={state} empty="Booking not found." isEmpty={(d) => d === null}>
          {(b) =>
            b ? (
              <div className="space-y-3">
                <Card>
                  <p className="text-sm text-[var(--rr-text-secondary)]">Contact person</p>
                  <p className="mt-1 text-lg font-medium text-white">{b.contactPerson || "—"}</p>
                  <p className="mt-1 text-sm text-white">{b.contactNumber || "—"}</p>
                  {b.alternateContact ? <p className="mt-1 text-xs text-[var(--rr-text-tertiary)]">Alternate: {b.alternateContact}</p> : null}
                </Card>
                {b.contactNumber ? (
                  <div className="flex gap-2">
                    <a href={`tel:${b.contactNumber}`} className="flex-1 rounded-2xl bg-[var(--rr-primary)] px-6 py-3 text-center text-sm font-semibold text-white">Call</a>
                    <a href={`https://wa.me/${b.contactNumber.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer" className="flex-1 rounded-2xl border border-[var(--rr-primary)] px-6 py-3 text-center text-sm font-semibold text-[var(--rr-primary)]">WhatsApp</a>
                  </div>
                ) : null}
                <Button href={`/provider-venue-navigation?id=${b.id}`} variant="ghost" className="w-full">Venue &amp; directions</Button>
              </div>
            ) : null
          }
        </AsyncView>
      )}
    </FlowScreen>
  );
}
