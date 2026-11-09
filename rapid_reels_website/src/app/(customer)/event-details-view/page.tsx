"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/FlowScreen";
import { statusLabel, statusTone } from "@/components/booking/BookingCard";
import { providerName } from "@/components/provider/ProviderCard";
import { Badge, Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AsyncView, Empty, Notice } from "@/components/ui/State";
import { getBooking, getProvider, updateBooking } from "@/lib/data/queries";
import { errorMessage, fmtDate, fmtMoney, titleCase } from "@/lib/format";
import { useAsync, useQuery } from "@/lib/hooks";

export default function Page() {
  const query = useQuery();
  const id = query.get("id");
  const state = useAsync(
    async () => {
      const booking = await getBooking(id!);
      if (!booking) return null;
      const provider = await getProvider(booking.providerId).catch(() => null);
      return { booking, provider };
    },
    [id],
    query.ready && Boolean(id),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    if (!id || !window.confirm("Cancel this booking? Refunds follow our cancellation policy.")) return;
    setBusy(true);
    setError(null);
    try {
      await updateBooking(id, {
        status: "cancelled",
        cancelledAt: new Date(),
        cancellationReason: "Cancelled by customer",
      });
      state.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  if (query.ready && !id) return <Empty>No event selected.</Empty>;

  return (
    <AsyncView state={state} empty="This event could not be found." isEmpty={(d) => d === null}>
      {(data) => {
        if (!data) return null;
        const { booking: b, provider } = data;
        const pay = b.payment;
        const unpaid = pay?.paymentStatus === "pending" && b.status !== "cancelled";
        const cancellable = b.status === "pending" || b.status === "confirmed";
        return (
          <div>
            <PageHeader
              title={b.eventName || "Event"}
              subtitle={b.venue?.name}
              action={<Badge tone={statusTone(b.status)}>{statusLabel(b.status)}</Badge>}
            />
            <Card className="mb-3 space-y-2 text-sm">
              <p className="text-[var(--rr-text-tertiary)]">Type · <span className="text-white">{titleCase(b.eventType)}</span></p>
              <p className="text-[var(--rr-text-tertiary)]">Date · <span className="text-white">{fmtDate(b.eventDate)} {b.eventTime}</span></p>
              <p className="text-[var(--rr-text-tertiary)]">Provider · <span className="text-white">{provider ? providerName(provider) : "—"}</span></p>
              <p className="text-[var(--rr-text-tertiary)]">Package · <span className="text-white">{b.package?.name ?? "—"}</span></p>
              <p className="text-[var(--rr-text-tertiary)]">Venue · <span className="text-white">{[b.venue?.address, b.venue?.city].filter(Boolean).join(", ") || "—"}</span></p>
              <p className="text-[var(--rr-text-tertiary)]">Amount · <span className="text-white">{fmtMoney(pay?.totalAmount, pay?.currency)}</span> <span className="text-xs">({titleCase(pay?.paymentStatus)})</span></p>
              {b.cancellationReason ? <p className="text-[var(--rr-text-tertiary)]">Cancelled · <span className="text-white">{b.cancellationReason}</span></p> : null}
            </Card>
            {error ? <div className="mb-3"><Notice>{error}</Notice></div> : null}
            <div className="flex flex-col gap-2">
              {unpaid ? <Button href={`/payment?bookingId=${b.id}`}>Pay now</Button> : null}
              <Button href={`/live-event-tracking?id=${b.id}`}>Live tracking</Button>
              <Button href={`/event-tracking?id=${b.id}`} variant="outline">Event timeline</Button>
              <Button href={`/booking-drive?id=${b.id}`} variant="outline">Photos &amp; videos drive</Button>
              <Button href="/reels" variant="ghost">View reels</Button>
              {cancellable ? (
                <Button type="button" variant="danger" onClick={cancel} disabled={busy}>
                  {busy ? "Cancelling…" : "Cancel booking"}
                </Button>
              ) : null}
            </div>
          </div>
        );
      }}
    </AsyncView>
  );
}
