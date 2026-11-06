import { FlowScreen } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";

function Inner() {
  return (
    <Card className="py-10 text-center">
      <p className="text-4xl text-[var(--rr-error)]">✕</p>
      <p className="mt-4 text-xl font-semibold text-white">Payment failed</p>
      <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">Static demo failure state.</p>
    </Card>
  );
}

export default function Page() {
  return (
    <FlowScreen
      title="Payment failed"
      subtitle="Try again or use another method"
      backHref="/booking-summary"
      nextHref="/payment"
      nextLabel="Retry payment"
    >
      <Inner />
    </FlowScreen>
  );
}
