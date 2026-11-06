import { PageHeader } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";
import { mockReels } from "@/lib/mock";

export default function Page() {
  const r = mockReels[0];
  return (
    <div>
      <PageHeader title="Reel details" />
      <Card className="space-y-2 text-sm">
        <p className="text-white">{r.title}</p>
        <p className="text-[var(--rr-text-tertiary)]">{r.eventType} · {r.author}</p>
        <p className="text-[var(--rr-text-secondary)]">Captured during live coverage and delivered in under 30 minutes.</p>
      </Card>
    </div>
  );
}
