import Link from "next/link";
import { Badge, Card } from "@/components/ui/Card";
import { mockBookings } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-white">Bookings</h1>
      {mockBookings.map((b) => (
        <Link key={b.id} href="/provider-booking-timeline">
          <Card className="mb-3 flex justify-between">
            <div>
              <p className="text-white">{b.title}</p>
              <p className="text-xs text-[var(--rr-text-tertiary)]">{b.date} · {b.amount}</p>
            </div>
            <Badge>{b.status}</Badge>
          </Card>
        </Link>
      ))}
    </div>
  );
}
