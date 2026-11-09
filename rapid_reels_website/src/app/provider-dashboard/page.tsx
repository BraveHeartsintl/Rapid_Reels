"use client";

import Link from "next/link";
import { FlowScreen } from "@/components/layout/FlowScreen";
import { BookingCard } from "@/components/booking/BookingCard";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Button } from "@/components/ui/Button";
import { Badge, Card } from "@/components/ui/Card";
import { AsyncView, ErrorState, Loading } from "@/components/ui/State";
import { useProviderDoc } from "@/lib/auth/useProviderDoc";
import { listProviderBookings } from "@/lib/data/queries";
import { fmtMoney, titleCase } from "@/lib/format";
import { useAsync } from "@/lib/hooks";

const links: Array<[string, string]> = [
  ["/provider-bookings", "All bookings"],
  ["/provider-booking-calendar", "Booking calendar"],
  ["/provider-my-reels", "My reels"],
  ["/provider-portfolio-upload", "Deliver a reel"],
  ["/provider-catalogue", "Catalogue"],
  ["/provider-business-profile", "Business profile & packages"],
  ["/provider-availability-calendar", "Availability"],
  ["/provider-service-areas", "Service areas"],
  ["/provider-earnings", "Earnings"],
  ["/provider-bank-details", "Bank details"],
  ["/provider-verification", "Verification"],
];

export default function Page() {
  const { uid, data: provider, loading, error, reload } = useProviderDoc();
  const bookings = useAsync(() => listProviderBookings(uid!), [uid], Boolean(uid));

  return (
    <FlowScreen title="Provider dashboard" subtitle={provider?.businessName ?? "Your studio at a glance"} backHref="/">
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="space-y-4">
          {provider && provider.verificationStatus !== "approved" ? (
            <Card className="border-[var(--rr-warning)]/50">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">Verification {titleCase(provider.verificationStatus)}</p>
                  <p className="text-xs text-[var(--rr-text-tertiary)]">
                    {provider.verificationStatus === "rejected"
                      ? provider.rejectionReason || "Please review your details and resubmit."
                      : "Complete identity verification to appear to customers."}
                  </p>
                </div>
                <Button href="/provider-verification" className="shrink-0 px-4 py-2 text-xs">Verify</Button>
              </div>
            </Card>
          ) : null}

          <div className="grid grid-cols-3 gap-3 text-center">
            <Card className="p-3"><p className="text-xl font-semibold text-white">{(provider?.rating ?? 0).toFixed(1)}</p><p className="text-[10px] text-[var(--rr-text-tertiary)]">Rating</p></Card>
            <Card className="p-3"><p className="text-xl font-semibold text-white">{provider?.totalEventsCompleted ?? 0}</p><p className="text-[10px] text-[var(--rr-text-tertiary)]">Events done</p></Card>
            <Card className="p-3"><p className="text-xl font-semibold text-white">{provider?.totalReelsDelivered ?? 0}</p><p className="text-[10px] text-[var(--rr-text-tertiary)]">Reels</p></Card>
          </div>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--rr-text-secondary)]">Upcoming &amp; requests</h2>
              <Link href="/provider-bookings" className="text-xs text-[var(--rr-secondary)]">See all</Link>
            </div>
            <AsyncView state={bookings} empty="No bookings yet.">
              {(rows) => {
                const active = rows.filter((b) => ["pending", "confirmed", "ongoing"].includes(b.status ?? ""));
                const pending = active.filter((b) => b.status === "pending").length;
                return (
                  <>
                    {pending > 0 ? <div className="mb-2"><Badge tone="warning">{pending} awaiting your response</Badge></div> : null}
                    {active.length === 0 ? (
                      <Card className="text-center text-sm text-[var(--rr-text-tertiary)]">No active bookings.</Card>
                    ) : (
                      active.slice(0, 4).map((b) => (
                        <BookingCard key={b.id} booking={b} href={`/provider-booking-status?id=${b.id}`} extra={b.payment?.totalAmount ? fmtMoney(b.payment.totalAmount, b.payment.currency) : undefined} />
                      ))
                    )}
                  </>
                );
              }}
            </AsyncView>
          </section>

          <div className="space-y-2">
            {links.map(([href, label]) => (
              <Link key={href} href={href} className="flex justify-between rounded-2xl bg-[var(--rr-card)] px-4 py-3 text-sm text-white">
                {label}
                <span className="text-[var(--rr-text-tertiary)]">→</span>
              </Link>
            ))}
          </div>
          <SignOutButton className="block w-full text-center" />
        </div>
      )}
    </FlowScreen>
  );
}
