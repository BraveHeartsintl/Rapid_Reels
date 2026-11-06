import { PageHeader } from "@/components/layout/FlowScreen";
import { Badge, Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockBookings } from "@/lib/mock";

export default function Page() {
  const b = mockBookings[0];
  return (
    <div>
      <PageHeader title={b.title} subtitle={b.venue} action={<Badge>{b.status}</Badge>} />
      <Card className="mb-3 space-y-2 text-sm">
        <p className="text-[var(--rr-text-tertiary)]">Date · <span className="text-white">{b.date}</span></p>
        <p className="text-[var(--rr-text-tertiary)]">Provider · <span className="text-white">{b.provider}</span></p>
        <p className="text-[var(--rr-text-tertiary)]">Amount · <span className="text-white">{b.amount}</span></p>
      </Card>
      <div className="flex flex-col gap-2">
        <Button href="/live-event-tracking">Live tracking</Button>
        <Button href="/event-tracking" variant="outline">Event timeline</Button>
        <Button href="/reels" variant="ghost">View reels</Button>
      </div>
    </div>
  );
}
