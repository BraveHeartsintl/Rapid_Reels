import Link from "next/link";
import { PageHeader } from "@/components/layout/FlowScreen";
import { Badge, Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockBookings, mockOffers, mockProviders, mockUser } from "@/lib/mock";

export const metadata = { title: "Home" };

export default function HomeAppPage() {
  return (
    <div>
      <PageHeader
        title={`Hi, ${mockUser.name.split(" ")[0]}`}
        subtitle={`${mockUser.city} · Wallet ₹${mockUser.walletBalance}`}
        action={
          <Button href="/event-type-selection" className="px-4 py-2 text-xs">
            Book
          </Button>
        }
      />

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-[var(--rr-text-secondary)]">Offers</h2>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {mockOffers.map((o) => (
            <Card key={o.id} className="min-w-[220px] shrink-0">
              <p className="font-medium text-white">{o.title}</p>
              <p className="mt-1 text-xs text-[var(--rr-secondary)]">{o.code}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--rr-text-secondary)]">Upcoming</h2>
          <Link href="/my-events" className="text-xs text-[var(--rr-secondary)]">
            See all
          </Link>
        </div>
        {mockBookings
          .filter((b) => b.status === "upcoming" || b.status === "ongoing")
          .map((b) => (
            <Link key={b.id} href={`/event-details-view?id=${b.id}`}>
              <Card className="mb-3 transition hover:border-[var(--rr-primary)]">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-white">{b.title}</p>
                    <p className="mt-1 text-xs text-[var(--rr-text-tertiary)]">
                      {b.date} · {b.venue}
                    </p>
                  </div>
                  <Badge tone={b.status === "ongoing" ? "warning" : "primary"}>{b.status}</Badge>
                </div>
              </Card>
            </Link>
          ))}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-[var(--rr-text-secondary)]">
          Top providers near you
        </h2>
        <div className="space-y-3">
          {mockProviders.map((p) => (
            <Link key={p.id} href={`/provider-details?id=${p.id}`}>
              <Card className="mb-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-white">{p.name}</p>
                    <p className="text-xs text-[var(--rr-text-tertiary)]">
                      ★ {p.rating} · {p.reviews} reviews · from {p.priceFrom}
                    </p>
                  </div>
                  {p.verified ? <Badge tone="success">Verified</Badge> : null}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
