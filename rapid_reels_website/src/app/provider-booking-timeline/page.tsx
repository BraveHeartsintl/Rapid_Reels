"use client";

import { FlowScreen } from "@/components/layout/FlowScreen";
import { StatusTimeline } from "@/components/booking/StatusTimeline";
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
    <FlowScreen title="Booking timeline" subtitle="Progress of this booking" backHref={id ? `/provider-booking-status?id=${id}` : "/provider-bookings"}>
      {query.ready && !id ? (
        <Empty>No booking selected. <a href="/provider-bookings" className="underline">All bookings</a></Empty>
      ) : (
        <AsyncView state={state} empty="Booking not found." isEmpty={(d) => d === null}>
          {(b) =>
            b ? (
              <div className="space-y-4">
                <Card className="text-sm">
                  <p className="font-medium text-white">{b.eventName}</p>
                  <p className="text-xs text-[var(--rr-text-tertiary)]">{fmtDate(b.eventDate)} {b.eventTime}</p>
                </Card>
                <StatusTimeline booking={b} />
              </div>
            ) : null
          }
        </AsyncView>
      )}
    </FlowScreen>
  );
}
