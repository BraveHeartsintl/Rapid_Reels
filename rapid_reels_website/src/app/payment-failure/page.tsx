"use client";

import { FlowScreen } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";
import { useQuery } from "@/lib/hooks";

export default function Page() {
  const query = useQuery();
  const bookingId = query.get("bookingId");
  const message = query.get("message");

  return (
    <FlowScreen
      title="Payment failed"
      subtitle="Try again or use another method"
      backHref="/booking-summary"
      nextHref={bookingId ? `/payment?bookingId=${bookingId}` : "/booking-summary"}
      nextLabel="Retry payment"
    >
      <Card className="py-10 text-center">
        <p className="text-4xl text-[var(--rr-error)]">✕</p>
        <p className="mt-4 text-xl font-semibold text-white">Payment failed</p>
        <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">
          {message ?? "Your card was not charged. You can retry in a moment."}
        </p>
      </Card>
    </FlowScreen>
  );
}
