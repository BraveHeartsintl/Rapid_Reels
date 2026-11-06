import { FlowScreen } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";

function Inner() {
  return (
    <div className="space-y-3">
      {[
        ["Event", "Priya & Arjun Wedding"],
        ["Package", "Premium Live"],
        ["Provider", "Lens & Light Studio"],
        ["Venue", "Taj Lands End, Mumbai"],
        ["Date", "18 Nov 2026"],
        ["Total", "₹19,999"],
      ].map(([k, v]) => (
        <Card key={k} className="flex justify-between text-sm">
          <span className="text-[var(--rr-text-tertiary)]">{k}</span>
          <span className="text-white">{v}</span>
        </Card>
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <FlowScreen
      title="Booking summary"
      subtitle="Review before payment"
      backHref="/package-customization"
      nextHref="/payment"
      nextLabel="Continue"
    >
      <Inner />
    </FlowScreen>
  );
}
