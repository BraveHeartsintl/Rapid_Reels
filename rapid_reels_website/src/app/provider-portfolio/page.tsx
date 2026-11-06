import { FlowScreen } from "@/components/layout/FlowScreen";
import { mockReels } from "@/lib/mock";
import { Card } from "@/components/ui/Card";

function Inner() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {mockReels.map((r) => (
        <Card
          key={r.id}
          className="flex aspect-square items-end bg-gradient-to-br from-[var(--rr-primary)]/30 to-[var(--rr-card)] p-3"
        >
          <span className="text-xs text-white">{r.title}</span>
        </Card>
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <FlowScreen
      title="Portfolio"
      subtitle="Sample work from this provider"
      backHref="/provider-details"
      nextHref="/catalogue-selection"
      nextLabel="Continue"
    >
      <Inner />
    </FlowScreen>
  );
}
