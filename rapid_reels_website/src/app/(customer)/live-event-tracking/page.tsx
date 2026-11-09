"use client";

import { PageHeader } from "@/components/layout/FlowScreen";
import { LiveEventView } from "@/components/booking/LiveEventView";
import { AsyncView, Empty } from "@/components/ui/State";
import { useUid } from "@/lib/auth/useUid";
import { listCustomerBookings } from "@/lib/data/queries";
import { useAsync, useQuery } from "@/lib/hooks";

export default function Page() {
  const query = useQuery();
  const uid = useUid();
  const id = query.get("id");
  // No id in the URL: follow the customer's currently ongoing event.
  const ongoing = useAsync(
    async () => (await listCustomerBookings(uid!)).find((b) => b.status === "ongoing")?.id ?? null,
    [uid],
    query.ready && !id && Boolean(uid),
  );

  return (
    <div>
      <PageHeader title="Live event" subtitle="Real-time coverage updates" />
      {id ? (
        <LiveEventView bookingId={id} />
      ) : (
        <AsyncView state={ongoing} empty="No event is live right now." isEmpty={(d) => d === null}>
          {(bookingId) => (bookingId ? <LiveEventView bookingId={bookingId} /> : <Empty>No event is live right now.</Empty>)}
        </AsyncView>
      )}
    </div>
  );
}
