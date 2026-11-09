"use client";

import { useState } from "react";
import { FlowScreen } from "@/components/layout/FlowScreen";
import { statusLabel, statusTone } from "@/components/booking/BookingCard";
import { Button } from "@/components/ui/Button";
import { Badge, Card } from "@/components/ui/Card";
import { AsyncView, Empty, Notice } from "@/components/ui/State";
import { getBooking, updateBooking } from "@/lib/data/queries";
import { errorMessage, fmtDate, fmtMoney, titleCase } from "@/lib/format";
import { useAsync, useQuery } from "@/lib/hooks";

export default function Page() {
  const query = useQuery();
  const id = query.get("id");
  const state = useAsync(() => getBooking(id!), [id], query.ready && Boolean(id));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function act(patch: Record<string, unknown>) {
    if (!id) return;
    setBusy(true);
    setError(null);
    try {
      await updateBooking(id, patch);
      state.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <FlowScreen title="Booking status" subtitle="Review and update this booking" backHref="/provider-bookings">
      {query.ready && !id ? (
        <Empty>No booking selected. <a href="/provider-bookings" className="underline">All bookings</a></Empty>
      ) : (
        <AsyncView state={state} empty="Booking not found." isEmpty={(d) => d === null}>
          {(b) => {
            if (!b) return null;
            const pay = b.payment;
            return (
              <div className="space-y-4">
                <Card className="space-y-2 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-base font-medium text-white">{b.eventName}</p>
                    <Badge tone={statusTone(b.status)}>{statusLabel(b.status)}</Badge>
                  </div>
                  <p className="text-[var(--rr-text-tertiary)]">{titleCase(b.eventType)} · {fmtDate(b.eventDate)} {b.eventTime}</p>
                  <p className="text-[var(--rr-text-tertiary)]">Package · <span className="text-white">{b.package?.name}</span> ({b.expectedReelsCount} reels)</p>
                  <p className="text-[var(--rr-text-tertiary)]">Guests · <span className="text-white">{b.guestCount}</span></p>
                  <p className="text-[var(--rr-text-tertiary)]">Payment · <span className="text-white">{fmtMoney(pay?.totalAmount, pay?.currency)}</span> ({titleCase(pay?.paymentStatus)})</p>
                  {b.specialRequirements ? <p className="text-[var(--rr-text-tertiary)]">Notes · <span className="text-white">{b.specialRequirements}</span></p> : null}
                </Card>
                {error ? <Notice>{error}</Notice> : null}
                <div className="flex flex-col gap-2">
                  {b.status === "pending" ? (
                    <>
                      <Button type="button" disabled={busy} onClick={() => act({ status: "confirmed", "eventStatus.providerAccepted": new Date() })}>Accept booking</Button>
                      <Button type="button" variant="danger" disabled={busy} onClick={() => { const reason = window.prompt("Reason for declining?"); if (reason) void act({ status: "cancelled", cancelledAt: new Date(), cancellationReason: `Declined by provider: ${reason}` }); }}>Decline</Button>
                    </>
                  ) : null}
                  {b.status === "confirmed" ? (
                    <Button type="button" disabled={busy} onClick={() => act({ status: "ongoing", "eventStatus.eventStarted": new Date() })}>Start event</Button>
                  ) : null}
                  {b.status === "ongoing" ? (
                    <Button type="button" disabled={busy} onClick={() => act({ status: "completed", completedAt: new Date(), "eventStatus.eventCompleted": new Date() })}>Mark completed</Button>
                  ) : null}
                  <Button href={`/provider-booking-timeline?id=${b.id}`} variant="outline">Timeline</Button>
                  <Button href={`/provider-customer-contact?id=${b.id}`} variant="outline">Customer contact</Button>
                  <Button href={`/provider-venue-navigation?id=${b.id}`} variant="outline">Venue &amp; directions</Button>
                  <Button href={`/provider-pre-event-checklist?id=${b.id}`} variant="outline">Pre-event checklist</Button>
                  <Button href={`/live-event-mode?id=${b.id}`} variant="outline">Live event mode</Button>
                  <Button href={`/provider-booking-drive?id=${b.id}`} variant="ghost">Booking drive</Button>
                </div>
              </div>
            );
          }}
        </AsyncView>
      )}
    </FlowScreen>
  );
}
