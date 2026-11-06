import Link from "next/link";
import { PageHeader } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";
import { mockReels } from "@/lib/mock";

export const metadata = { title: "My Reels" };

export default function MyReelsPage() {
  return (
    <div>
      <PageHeader title="My Reels" subtitle="Delivered from your bookings" />
      <div className="space-y-3">
        {mockReels.map((r) => (
          <Link key={r.id} href={`/reel-player?id=${r.id}`}>
            <Card className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-white">{r.title}</p>
                <p className="text-xs text-[var(--rr-text-tertiary)]">{r.eventType}</p>
              </div>
              <span className="text-[var(--rr-secondary)]">Play →</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
