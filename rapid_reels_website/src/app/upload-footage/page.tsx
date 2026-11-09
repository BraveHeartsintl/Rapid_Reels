"use client";

import { FlowScreen } from "@/components/layout/FlowScreen";
import { DriveManager } from "@/components/booking/DriveManager";
import { BookingPicker } from "@/components/provider/BookingPicker";
import { useQuery } from "@/lib/hooks";

export default function Page() {
  const query = useQuery();
  const id = query.get("id");
  return (
    <FlowScreen title="Upload footage" subtitle="Add raw photos and videos to the booking drive" backHref={id ? `/live-event-mode?id=${id}` : "/provider-dashboard"}>
      {!query.ready ? null : id ? (
        <DriveManager bookingId={id} />
      ) : (
        <BookingPicker
          statuses={["confirmed", "ongoing", "completed"]}
          hrefFor={(b) => `/upload-footage?id=${b}`}
          empty="No confirmed bookings to upload footage for."
        />
      )}
    </FlowScreen>
  );
}
