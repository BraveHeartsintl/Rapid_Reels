"use client";

import { FlowScreen } from "@/components/layout/FlowScreen";
import { ProviderBookingList } from "@/components/provider/ProviderBookingList";

export default function Page() {
  return (
    <FlowScreen title="All bookings" subtitle="Requests and confirmed events" backHref="/provider-dashboard">
      <ProviderBookingList />
    </FlowScreen>
  );
}
