import Link from "next/link";
import { PageHeader } from "@/components/layout/FlowScreen";
import { Badge, Card } from "@/components/ui/Card";
import { mockBookings } from "@/lib/mock";

export const metadata = { title: "My Events" };

const filters = ["All", "Upcoming", "Ongoing", "Completed", "Cancelled"];

export default function MyEventsPage() {
  return (
    <div>
      <PageHeader title="My Events" subtitle="Track bookings end to end" />
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {filters.map((f, i) => (
          <span
            key={f}
            className={`shrink-0 rounded-full px-3 py-1 text-xs ${
              i === 0
                ? "bg-[var(--rr-primary)] text-white"
                : "bg-[var(--rr-card)] text-[var(--rr-text-tertiary)]"
            }`}
          >
            {f}
          </span>
        ))}
      </div>
      <div className="space-y-3">
        {mockBookings.map((b) => (
          <Link key={b.id} href={`/event-details-view?id=${b.id}`}>
            <Card className="mb-3">
              <div className="flex justify-between gap-2">
                <div>
                  <p className="font-medium text-white">{b.title}</p>
                  <p className="mt-1 text-xs text-[var(--rr-text-tertiary)]">
                    {b.type} · {b.date}
                  </p>
                  <p className="text-xs text-[var(--rr-text-secondary)]">{b.provider}</p>
                </div>
                <Badge
                  tone={
                    b.status === "completed"
                      ? "success"
                      : b.status === "ongoing"
                        ? "warning"
                        : "primary"
                  }
                >
                  {b.status}
                </Badge>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
