"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { FlowScreen } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AsyncView, Empty, Notice } from "@/components/ui/State";
import { createStripePaymentIntent, getBooking } from "@/lib/data/queries";
import { fmtMoney } from "@/lib/format";
import { useAsync, useQuery } from "@/lib/hooks";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

function CheckoutForm({ bookingId, amountLabel }: { bookingId: string; amountLabel: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError(null);
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/payment-success?bookingId=${bookingId}` },
      redirect: "if_required",
    });
    if (stripeError) {
      const msg = stripeError.message ?? "Payment could not be completed.";
      if (stripeError.type === "validation_error") {
        setError(msg);
        setBusy(false);
      } else {
        router.push(`/payment-failure?bookingId=${bookingId}&message=${encodeURIComponent(msg)}`);
      }
      return;
    }
    router.push(`/payment-success?bookingId=${bookingId}`);
  }

  return (
    <form onSubmit={pay} className="space-y-4">
      <PaymentElement />
      {error ? <Notice>{error}</Notice> : null}
      <Button type="submit" className="w-full" disabled={!stripe || busy}>
        {busy ? "Processing…" : `Pay ${amountLabel}`}
      </Button>
    </form>
  );
}

export default function Page() {
  const query = useQuery();
  const bookingId = query.get("bookingId");
  const stripePromise = useMemo(() => (publishableKey ? loadStripe(publishableKey) : null), []);

  const state = useAsync(
    async () => {
      const booking = await getBooking(bookingId!);
      if (!booking) return null;
      if (booking.payment?.paymentStatus && booking.payment.paymentStatus !== "pending") {
        return { booking, clientSecret: null as string | null };
      }
      const intent = await createStripePaymentIntent(bookingId!);
      return { booking, clientSecret: intent.clientSecret };
    },
    [bookingId],
    query.ready && Boolean(bookingId) && Boolean(publishableKey),
  );

  return (
    <FlowScreen
      title="Payment"
      subtitle="Secure checkout with Stripe"
      backHref={bookingId ? `/event-details-view?id=${bookingId}` : "/booking-summary"}
    >
      {query.ready && !bookingId ? (
        <Empty>No booking to pay for.</Empty>
      ) : !publishableKey ? (
        <Notice>Stripe is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local.</Notice>
      ) : (
        <AsyncView state={state} empty="Booking not found." isEmpty={(d) => d === null}>
          {(data) => {
            if (!data) return null;
            const pay = data.booking.payment;
            const amount = fmtMoney(pay?.advanceAmount ?? pay?.totalAmount, pay?.currency);
            if (!data.clientSecret) {
              return (
                <Card className="text-center text-sm text-white">
                  This booking has already been paid.
                  <div className="mt-4"><Button href={`/event-details-view?id=${data.booking.id}`}>View event</Button></div>
                </Card>
              );
            }
            return (
              <div className="space-y-4">
                <Card>
                  <p className="text-sm text-[var(--rr-text-secondary)]">Amount due</p>
                  <p className="text-3xl font-bold text-white">{amount}</p>
                  <p className="mt-1 text-xs text-[var(--rr-text-tertiary)]">{data.booking.eventName}</p>
                </Card>
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret: data.clientSecret,
                    appearance: { theme: "night", variables: { colorPrimary: "#6A00FF" } },
                  }}
                >
                  <CheckoutForm bookingId={data.booking.id} amountLabel={amount} />
                </Elements>
              </div>
            );
          }}
        </AsyncView>
      )}
    </FlowScreen>
  );
}
