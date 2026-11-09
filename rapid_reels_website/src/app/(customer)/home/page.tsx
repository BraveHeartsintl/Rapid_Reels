"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/FlowScreen";
import { BookingCard } from "@/components/booking/BookingCard";
import { ProviderCard } from "@/components/provider/ProviderCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AsyncView } from "@/components/ui/State";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useUid } from "@/lib/auth/useUid";
import { listCustomerBookings, listProviders, listPublicOffers } from "@/lib/data/queries";
import { fmtDate, fmtMoney } from "@/lib/format";
import { useAsync } from "@/lib/hooks";

function offerLabel(o: { discount?: { percentage?: number | null; amount?: number | null } }): string {
  if (o.discount?.percentage) return `${o.discount.percentage}% off`;
  if (o.discount?.amount) return `${fmtMoney(o.discount.amount)} off`;
  return "";
}

export default function HomeAppPage() {
  const { profile } = useAuth();
  const uid = useUid();
  const offers = useAsync(listPublicOffers, []);
  const bookings = useAsync(() => listCustomerBookings(uid!), [uid], Boolean(uid));
  const providers = useAsync(async () => (await listProviders()).slice(0, 5), []);

  const first = (profile?.fullName ?? "").split(" ")[0] || "there";
  const city = profile?.currentLocation?.city;

  return (
    <div>
      <PageHeader
        title={`Hi, ${first}`}
        subtitle={`${city && city !== "Unknown" ? `${city} · ` : ""}Wallet ${fmtMoney(profile?.walletBalance ?? 0)}`}
        action={
          <Button href="/event-type-selection" className="px-4 py-2 text-xs">
            Book
          </Button>
        }
      />

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-[var(--rr-text-secondary)]">Offers</h2>
        <AsyncView state={offers} empty="No offers right now.">
          {(items) => (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {items.map((o) => (
                <Card key={o.id} className="min-w-[220px] shrink-0">
                  <p className="font-medium text-white">{o.title}</p>
                  <p className="mt-1 text-xs text-[var(--rr-secondary)]">
                    {o.code} {offerLabel(o) ? `· ${offerLabel(o)}` : ""}
                  </p>
                  {o.expiresAt ? (
                    <p className="mt-1 text-[10px] text-[var(--rr-text-tertiary)]">Until {fmtDate(o.expiresAt)}</p>
                  ) : null}
                </Card>
              ))}
            </div>
          )}
        </AsyncView>
      </section>

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--rr-text-secondary)]">Upcoming</h2>
          <Link href="/my-events" className="text-xs text-[var(--rr-secondary)]">
            See all
          </Link>
        </div>
        <AsyncView state={bookings} empty="No upcoming events. Book your first one!">
          {(rows) => {
            const upcoming = rows.filter((b) => b.status && ["pending", "confirmed", "ongoing"].includes(b.status));
            return upcoming.length === 0 ? (
              <Card className="text-center text-sm text-[var(--rr-text-tertiary)]">No upcoming events.</Card>
            ) : (
              <>
                {upcoming.slice(0, 3).map((b) => (
                  <BookingCard key={b.id} booking={b} href={`/event-details-view?id=${b.id}`} />
                ))}
              </>
            );
          }}
        </AsyncView>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-[var(--rr-text-secondary)]">Top providers near you</h2>
        <AsyncView state={providers} empty="No providers yet.">
          {(rows) => (
            <div>
              {rows.map((p) => (
                <ProviderCard key={p.id} provider={p} />
              ))}
            </div>
          )}
        </AsyncView>
      </section>
    </div>
  );
}
