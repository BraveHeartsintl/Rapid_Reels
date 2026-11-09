"use client";

import { useEffect, useState } from "react";
import { FlowScreen } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";
import { Empty } from "@/components/ui/State";
import { clearDraft } from "@/lib/booking/draft";
import { getBooking } from "@/lib/data/queries";
import { fmtDate, fmtMoney, titleCase } from "@/lib/format";
import { useQuery } from "@/lib/hooks";
import type { BookingDoc, WithId } from "@/lib/data/types";

export default function Page() {
  const query = useQuery();
  const bookingId = query.get("bookingId");
  const [booking, setBooking] = useState<WithId<BookingDoc> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    clearDraft();
    let cancelled = false;
    let tries = 0;
    // The Stripe webhook marks the booking as paid shortly after confirmation; poll briefly.
    async function load() {
      try {
        const b = await getBooking(bookingId!);
        if (cancelled) return;
        setBooking(b);
        if (b?.payment?.paymentStatus === "pending" && tries++ < 8) window.setTimeout(load, 2000);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load booking");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  const paid = booking?.payment?.paymentStatus && booking.payment.paymentStatus !== "pending";

  return (
    <FlowScreen
      title={paid ? "Payment successful" : "Payment received"}
      subtitle={paid ? "Your booking is confirmed" : "We are confirming your payment"}
      backHref="/home"
      nextHref="/my-events"
      nextLabel="Go to My Events"
    >
      {query.ready && !bookingId ? (
        <Empty>No booking reference.</Empty>
      ) : (
        <Card className="py-10 text-center">
          <p className="text-4xl">{paid ? "✓" : "…"}</p>
          <p className="mt-4 text-xl font-semibold text-white">{paid ? "Booking confirmed" : "Processing payment"}</p>
          {booking ? (
            <>
              <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">
                {booking.eventName} · {fmtDate(booking.eventDate)}
              </p>
              <p className="mt-1 text-sm text-[var(--rr-text-secondary)]">
                {fmtMoney(booking.payment?.advanceAmount ?? booking.payment?.totalAmount, booking.payment?.currency)} · {titleCase(booking.payment?.paymentStatus)}
              </p>
              <p className="mt-2 text-xs text-[var(--rr-text-tertiary)]">Reference {booking.id}</p>
            </>
          ) : null}
          {error ? <p className="mt-2 text-xs text-[var(--rr-error)]">{error}</p> : null}
        </Card>
      )}
    </FlowScreen>
  );
}
