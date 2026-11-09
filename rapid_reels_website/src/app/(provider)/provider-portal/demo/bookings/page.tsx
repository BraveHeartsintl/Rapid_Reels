"use client";

import { ProviderBookingList } from "@/components/provider/ProviderBookingList";

export default function Page() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-white">Bookings</h1>
      <ProviderBookingList />
    </div>
  );
}
