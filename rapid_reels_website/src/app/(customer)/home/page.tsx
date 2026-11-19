"use client";

import Link from "next/link";
import { BookingCard } from "@/components/booking/BookingCard";
import { ProviderCard } from "@/components/provider/ProviderCard";
import { ReelTile } from "@/components/reel/ReelTile";
import { Button } from "@/components/ui/Button";
import { AsyncView, Empty } from "@/components/ui/State";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useUid } from "@/lib/auth/useUid";
import { listCustomerBookings, listDiscoverReels, listProviders, listPublicOffers } from "@/lib/data/queries";
import { fmtDate, fmtMoney } from "@/lib/format";
import { useAsync } from "@/lib/hooks";

function offerLabel(o: { discount?: { percentage?: number | null; amount?: number | null } }): string {
  if (o.discount?.percentage) return `${o.discount.percentage}% off`;
  if (o.discount?.amount) return `${fmtMoney(o.discount.amount)} off`;
  return "";
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function SectionHeader({ title, href, linkLabel = "See all" }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {href ? (
        <Link href={href} className="text-sm font-medium text-[var(--rr-secondary)] hover:underline">
          {linkLabel} →
        </Link>
      ) : null}
    </div>
  );
}

const QUICK_ACTIONS = [
  { href: "/event-type-selection", label: "Book event", icon: "＋", hint: "Find a creator" },
  { href: "/discover", label: "Discover", icon: "◎", hint: "Browse reels" },
  { href: "/my-events", label: "My events", icon: "▦", hint: "Track bookings" },
  { href: "/wallet", label: "Wallet", icon: "◈", hint: "Balance & offers" },
];

export default function HomeAppPage() {
  const { profile } = useAuth();
  const uid = useUid();
  const offers = useAsync(listPublicOffers, []);
  const bookings = useAsync(() => listCustomerBookings(uid!), [uid], Boolean(uid));
  const providers = useAsync(async () => (await listProviders()).slice(0, 6), []);
  const reels = useAsync(() => listDiscoverReels(6), []);

  const first = (profile?.fullName ?? "").split(" ")[0] || "there";
  const city = profile?.currentLocation?.city;

  return (
    <div className="space-y-10">
      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[var(--rr-primary)]/30 via-[#7a1fa2]/20 to-[var(--rr-surface)] px-6 py-8 sm:px-10 sm:py-10">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[var(--rr-primary)]/25 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--rr-text-secondary)]">{greeting()}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Hi, <span className="text-gradient">{first}</span>
            </h1>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              {city && city !== "Unknown" ? (
                <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[var(--rr-text-secondary)] backdrop-blur">
                  📍 {city}
                </span>
              ) : null}
              <Link
                href="/wallet"
                className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[var(--rr-text-secondary)] backdrop-blur transition hover:text-white"
              >
                Wallet <span className="font-semibold text-white">{fmtMoney(profile?.walletBalance ?? 0)}</span>
              </Link>
            </div>
          </div>
          <Button href="/event-type-selection" className="w-full sm:w-auto sm:px-8">
            Book an event
          </Button>
        </div>
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group flex items-center gap-3 rounded-2xl border border-[var(--rr-outline)]/60 bg-[var(--rr-card)] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--rr-primary)]/70"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--rr-primary)]/15 text-lg text-[var(--rr-secondary)] transition group-hover:bg-[var(--rr-primary)] group-hover:text-white">
              {a.icon}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-white">{a.label}</span>
              <span className="block truncate text-xs text-[var(--rr-text-tertiary)]">{a.hint}</span>
            </span>
          </Link>
        ))}
      </section>

      {/* Offers */}
      <section>
        <SectionHeader title="Offers for you" />
        <AsyncView state={offers} empty="No offers right now. Check back soon.">
          {(items) => (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {items.map((o) => (
                <div
                  key={o.id}
                  className="relative overflow-hidden rounded-2xl border border-[var(--rr-primary)]/30 bg-gradient-to-br from-[var(--rr-primary)]/15 to-[var(--rr-card)] p-5"
                >
                  {offerLabel(o) ? (
                    <p className="text-2xl font-extrabold text-white">{offerLabel(o)}</p>
                  ) : null}
                  <p className="mt-1 font-medium text-[var(--rr-text-secondary)]">{o.title}</p>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    {o.code ? (
                      <span className="rounded-lg border border-dashed border-white/30 bg-black/20 px-2.5 py-1 font-mono text-xs font-semibold tracking-wider text-white">
                        {o.code}
                      </span>
                    ) : (
                      <span />
                    )}
                    {o.expiresAt ? (
                      <span className="text-[11px] text-[var(--rr-text-tertiary)]">Until {fmtDate(o.expiresAt)}</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </AsyncView>
      </section>

      {/* Upcoming */}
      <section>
        <SectionHeader title="Upcoming events" href="/my-events" />
        <AsyncView state={bookings} empty="No upcoming events. Book your first one!">
          {(rows) => {
            const upcoming = rows.filter((b) => b.status && ["pending", "confirmed", "ongoing"].includes(b.status));
            return upcoming.length === 0 ? (
              <Empty>
                <p className="text-3xl">🎉</p>
                <p className="mt-2 font-medium text-white">No upcoming events</p>
                <p className="mt-1">Book a verified creator for your next celebration.</p>
                <Button href="/event-type-selection" className="mx-auto mt-4 px-6 py-2 text-sm">
                  Book your first event
                </Button>
              </Empty>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {upcoming.slice(0, 4).map((b) => (
                  <BookingCard key={b.id} booking={b} href={`/event-details-view?id=${b.id}`} />
                ))}
              </div>
            );
          }}
        </AsyncView>
      </section>

      {/* Trending reels */}
      <section>
        <SectionHeader title="Trending reels" href="/discover" linkLabel="Discover more" />
        <AsyncView state={reels} empty="No reels have been published yet.">
          {(rows) => (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
              {rows.map((r) => (
                <ReelTile key={r.id} reel={r} href={`/reel-player?id=${r.id}`} showStats />
              ))}
            </div>
          )}
        </AsyncView>
      </section>

      {/* Providers */}
      <section>
        <SectionHeader title="Top providers near you" href="/provider-selection" />
        <AsyncView state={providers} empty="No providers yet.">
          {(rows) => (
            <div className="grid gap-x-4 lg:grid-cols-2">
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
