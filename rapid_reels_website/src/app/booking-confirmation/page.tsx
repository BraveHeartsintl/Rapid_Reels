"use client";

import { FlowScreen } from "@/components/layout/FlowScreen";
import { providerName } from "@/components/provider/ProviderCard";
import { Card } from "@/components/ui/Card";
import { AsyncView, Empty } from "@/components/ui/State";
import { getBooking, getProvider } from "@/lib/data/queries";
import { fmtDate, fmtMoney, titleCase } from "@/lib/format";
import { useAsync, useQuery } from "@/lib/hooks";

export default function Page() {
  const query = useQuery();
  const id = query.get("bookingId") ?? query.get("id");
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

  return (
    <FlowScreen title="Confirmation" subtitle="Everything is set" backHref="/home" nextHref="/my-events" nextLabel="Go to My Events">
      {query.ready && !id ? (
        <Empty>No booking selected.</Empty>
      ) : (
        <AsyncView state={state} empty="Booking not found." isEmpty={(d) => d === null}>
          {(data) => {
            if (!data) return null;
            const { booking: b, provider } = data;
            return (
              <Card className="space-y-2 text-sm">
                <p className="font-semibold text-white">You are booked</p>
                <p className="text-[var(--rr-text-secondary)]">
                  {b.eventName} · {fmtDate(b.eventDate)} {b.eventTime}
                </p>
                <p className="text-[var(--rr-text-secondary)]">{provider ? providerName(provider) : ""}</p>
                <p className="text-[var(--rr-text-secondary)]">
                  {fmtMoney(b.payment?.totalAmount, b.payment?.currency)} · {titleCase(b.payment?.paymentStatus)}
                </p>
                <p className="text-xs text-[var(--rr-text-tertiary)]">We will notify you as the event approaches. Reference {b.id}</p>
              </Card>
            );
          }}
        </AsyncView>
      )}
    </FlowScreen>
  );
}
