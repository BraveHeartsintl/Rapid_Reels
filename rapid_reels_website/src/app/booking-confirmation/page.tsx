import { FlowScreen } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";

function Inner() {
  return (
    <Card>
      <p className="font-semibold text-white">You are booked</p>
      <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">
        We will notify you as the event approaches.
      </p>
    </Card>
  );
}

export default function Page() {
  return (
    <FlowScreen
      title="Confirmation"
      subtitle="Everything is set"
      backHref="/home"
      nextHref="/my-events"
      nextLabel="Go to My Events"
    >
      <Inner />
    </FlowScreen>
  );
}
