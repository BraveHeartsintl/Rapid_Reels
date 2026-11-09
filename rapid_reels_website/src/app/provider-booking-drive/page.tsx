"use client";

import { FlowScreen } from "@/components/layout/FlowScreen";
import { DriveManager } from "@/components/booking/DriveManager";
import { BookingPicker } from "@/components/provider/BookingPicker";
import { useQuery } from "@/lib/hooks";

export default function Page() {
  const query = useQuery();
  const id = query.get("id");
  return (
    <FlowScreen title="Booking drive" subtitle="Raw footage for this booking" backHref={id ? `/provider-booking-status?id=${id}` : "/provider-dashboard"}>
      {!query.ready ? null : id ? (
        <DriveManager bookingId={id} />
      ) : (
        <BookingPicker hrefFor={(b) => `/provider-booking-drive?id=${b}`} />
      )}
    </FlowScreen>
  );
}
