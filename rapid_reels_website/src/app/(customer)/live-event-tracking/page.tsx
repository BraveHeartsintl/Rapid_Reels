import { PageHeader } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Card";

export default function Page() {
  return (
    <div>
      <PageHeader title="Live event" action={<Badge tone="warning">LIVE</Badge>} />
      <Card className="mb-4">
        <p className="text-sm text-[var(--rr-text-secondary)]">Crew on site</p>
        <p className="mt-2 text-white">Lens & Light Studio · 2 shooters</p>
      </Card>
      <Card>
        <p className="text-sm text-white">Latest reel delivered 12 min ago</p>
        <a href="/reel-player" className="mt-3 inline-block text-sm text-[var(--rr-secondary)]">Watch →</a>
      </Card>
    </div>
  );
}
