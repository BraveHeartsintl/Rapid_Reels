"use client";

import { PageHeader } from "@/components/layout/FlowScreen";
import { StatusTimeline } from "@/components/booking/StatusTimeline";
import { AsyncView, Empty } from "@/components/ui/State";
import { getBooking } from "@/lib/data/queries";
import { useAsync, useQuery } from "@/lib/hooks";

export default function Page() {
  const query = useQuery();
  const id = query.get("id");
  const state = useAsync(() => getBooking(id!), [id], query.ready && Boolean(id));

  if (query.ready && !id) return <Empty>No event selected.</Empty>;

  return (
    <div>
      <PageHeader title="Event timeline" />
      <AsyncView state={state} empty="This event could not be found." isEmpty={(d) => d === null}>
        {(b) => (b ? <StatusTimeline booking={b} /> : null)}
      </AsyncView>
    </div>
  );
}
