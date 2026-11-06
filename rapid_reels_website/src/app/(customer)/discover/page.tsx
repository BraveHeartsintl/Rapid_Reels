import Link from "next/link";
import { PageHeader } from "@/components/layout/FlowScreen";
import { Badge, Card } from "@/components/ui/Card";
import { eventTypes, mockReels } from "@/lib/mock";

export const metadata = { title: "Discover" };

export default function DiscoverPage() {
  return (
    <div>
      <PageHeader title="Discover" subtitle="Trending event reels" />
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <Badge tone="primary">All</Badge>
        {eventTypes.map((e) => (
          <Badge key={e.id} tone="muted">
            {e.label}
          </Badge>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {mockReels.map((r) => (
          <Link key={r.id} href={`/reel-player?id=${r.id}`}>
            <Card className="aspect-[9/14] overflow-hidden p-0">
              <div className="flex h-full flex-col justify-end bg-gradient-to-br from-[var(--rr-primary)]/40 to-[var(--rr-surface)] p-3">
                <p className="text-sm font-medium text-white">{r.title}</p>
                <p className="text-[10px] text-[var(--rr-text-secondary)]">
                  {r.author} · ♥ {r.likes}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
