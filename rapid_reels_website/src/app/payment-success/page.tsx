import { FlowScreen } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";

function Inner() {
  return (
    <Card className="py-10 text-center">
      <p className="text-4xl">✓</p>
      <p className="mt-4 text-xl font-semibold text-white">Booking confirmed</p>
      <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">Reference RR-2026-118</p>
    </Card>
  );
}

export default function Page() {
  return (
    <FlowScreen
      title="Payment successful"
      subtitle="Your booking is confirmed"
      backHref="/home"
      nextHref="/my-events"
      nextLabel="Go to My Events"
    >
      <Inner />
    </FlowScreen>
  );
}
