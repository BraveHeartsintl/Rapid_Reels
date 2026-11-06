import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockBookings, mockEarnings } from "@/lib/mock";

export default function Page() {
  const next = mockBookings[0];
  const latest = mockEarnings[mockEarnings.length - 1];
  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Today</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-[var(--rr-text-tertiary)]">Next booking</p>
          <p className="mt-2 font-medium text-white">{next.title}</p>
          <p className="text-xs text-[var(--rr-text-secondary)]">{next.date}</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--rr-text-tertiary)]">Month earnings</p>
          <p className="mt-2 text-2xl font-bold text-white">₹{latest.amount.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--rr-text-tertiary)]">Quick actions</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button href="/live-event-mode" className="text-xs px-3 py-2">Live mode</Button>
            <Button href="/provider-catalogue" variant="outline" className="text-xs px-3 py-2">Catalogue</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
