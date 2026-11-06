import { FlowScreen } from "@/components/layout/FlowScreen";
import { Input } from "@/components/ui/Input";

function Inner() {
  return (
    <div className="space-y-4">
      <Input label="Event title" defaultValue="Priya & Arjun Wedding" />
      <Input label="Date" type="date" defaultValue="2026-11-18" />
      <Input label="Guest count" type="number" defaultValue="180" />
      <Input label="Notes" placeholder="Key moments to capture" />
    </div>
  );
}

export default function Page() {
  return (
    <FlowScreen
      title="Event details"
      subtitle="Tell us about the day"
      backHref="/package-selection"
      nextHref="/venue-selection"
      nextLabel="Continue"
    >
      <Inner />
    </FlowScreen>
  );
}
