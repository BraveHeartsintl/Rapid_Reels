"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlowScreen } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Empty, Notice } from "@/components/ui/State";
import { saveDraft, useBookingDraft, type BookingDraft } from "@/lib/booking/draft";
import { draftFingerprint, draftTotal } from "@/lib/booking/pricing";
import { useAuth } from "@/lib/auth/AuthProvider";
import { createBooking, getBooking, listPublicOffers, updateBooking } from "@/lib/data/queries";
import type { OfferDoc, WithId } from "@/lib/data/types";
import { dateKeyLocal, errorMessage, fmtMoney, titleCase } from "@/lib/format";
import { toDate } from "@/lib/data/types";

const MIN_PAYABLE = 0.3;

function discountFor(offer: OfferDoc, total: number): number {
  const d = offer.discount ?? {};
  let amount = 0;
  if (d.percentage) amount = (total * d.percentage) / 100;
  else if (d.amount) amount = d.amount;
  if (d.maxDiscount) amount = Math.min(amount, d.maxDiscount);
  return Math.max(0, Math.min(amount, total));
}

function parseLocalDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function buildPayload(d: BookingDraft, customerId: string, total: number, offer: WithId<OfferDoc> | null, discount: number) {
  const pkg = d.package!;
  const c = d.customizations ?? { editingStyle: pkg.editingStyle, musicPreference: "", colorGrading: "", includeDrone: false, additionalReels: 0, additionalCost: 0 };
  const eventDate = parseLocalDate(d.eventDate!);
  const venue = d.venue!;
  return {
    customerId,
    providerId: d.providerId,
    eventType: d.eventType ?? "wedding",
    eventName: d.eventName,
    eventDate,
    eventDateKey: dateKeyLocal(eventDate),
    eventTime: d.eventTime ?? "10:00",
    duration: pkg.duration,
    guestCount: d.guestCount ?? 0,
    venue: { ...venue, coordinates: { latitude: 0, longitude: 0 } },
    package: pkg,
    customizations: c,
    specialRequirements: d.specialRequirements ?? null,
    keyMoments: d.keyMoments?.length ? d.keyMoments : null,
    status: "pending",
    eventStatus: {
      bookingConfirmed: null,
      providerAccepted: null,
      eventStarted: null,
      firstReelDelivered: null,
      eventCompleted: null,
      allReelsDelivered: null,
    },
    payment: {
      totalAmount: total,
      advanceAmount: total,
      remainingAmount: 0,
      currency: "gbp",
      paymentStatus: "pending",
      transactions: null,
    },
    contactPerson: d.contactPerson ?? "",
    contactNumber: d.contactNumber ?? "",
    alternateContact: null,
    expectedReelsCount: pkg.reelsCount + c.additionalReels,
    deliveryTimeline: "same_day",
    cancelledAt: null,
    cancellationReason: null,
    completedAt: null,
    metadata: offer
      ? { offerId: offer.id, couponCode: offer.code, discountAmount: discount, subtotalAmount: draftTotal(d), source: "web" }
      : { source: "web" },
    catalogueEventId: d.catalogueEventId ?? null,
    catalogueTitle: d.catalogueTitle ?? null,
    catalogueHeroUrl: d.catalogueHeroUrl ?? null,
  };
}

export default function Page() {
  const router = useRouter();
  const draft = useBookingDraft();
  const { user } = useAuth();
  const [codeInput, setCodeInput] = useState<string | null>(null);
  const [offer, setOffer] = useState<WithId<OfferDoc> | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [terms, setTerms] = useState(false);
  const [refund, setRefund] = useState(false);
  const [rights, setRights] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = draftTotal(draft);
  const discount = offer ? discountFor(offer, subtotal) : 0;
  const total = Math.max(0, subtotal - discount);
  const complete = Boolean(draft.providerId && draft.package && draft.eventDate && draft.eventName && draft.venue);
  const code = codeInput ?? draft.couponCode ?? "";

  async function applyCoupon() {
    setCouponMsg(null);
    const wanted = code.trim().toUpperCase();
    if (!wanted) return;
    try {
      const offers = await listPublicOffers();
      const found = offers.find((o) => o.code?.toUpperCase() === wanted);
      const now = Date.now();
      const end = toDate(found?.expiresAt ?? found?.validity?.endDate)?.getTime();
      const start = toDate(found?.validity?.startDate)?.getTime();
      if (!found) throw new Error("That code is not valid.");
      if (end && end < now) throw new Error("That code has expired.");
      if (start && start > now) throw new Error("That code is not active yet.");
      if (found.maxUses && (found.usedCount ?? 0) >= found.maxUses) throw new Error("That code has been fully redeemed.");
      setOffer(found);
      saveDraft({ couponCode: found.code });
      setCouponMsg({ tone: "success", text: `Applied ${found.code}.` });
    } catch (e) {
      setOffer(null);
      setCouponMsg({ tone: "error", text: errorMessage(e) });
    }
  }

  async function confirm() {
    if (!user || !complete) return;
    setError(null);
    if (total < MIN_PAYABLE) return setError("Payment amount is too low. The minimum is £0.30.");
    setBusy(true);
    try {
      const fingerprint = draftFingerprint(draft) + JSON.stringify([offer?.id, total]);
      if (draft.bookingId && draft.bookingFingerprint === fingerprint) {
        const existing = await getBooking(draft.bookingId).catch(() => null);
        if (existing && existing.status === "pending" && existing.payment?.paymentStatus === "pending") {
          return router.push(`/payment?bookingId=${draft.bookingId}`);
        }
      } else if (draft.bookingId) {
        // details changed since the last attempt: release the unpaid hold on the date
        await updateBooking(draft.bookingId, {
          status: "cancelled",
          cancelledAt: new Date(),
          cancellationReason: "Replaced by an updated booking",
        }).catch(() => undefined);
      }
      const bookingId = await createBooking(buildPayload(draft, user.uid, total, offer, discount));
      saveDraft({ bookingId, bookingFingerprint: fingerprint });
      router.push(`/payment?bookingId=${bookingId}`);
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  const rows: Array<[string, string]> = [
    ["Event", draft.eventName ?? "—"],
    ["Type", titleCase(draft.eventType) || "—"],
    ["Package", draft.package?.name ?? "—"],
    ["Provider", draft.providerName ?? "—"],
    ["Venue", draft.venue ? `${draft.venue.name}, ${draft.venue.city}` : "—"],
    ["Date", draft.eventDate ? `${draft.eventDate} ${draft.eventTime ?? ""}` : "—"],
    ["Guests", draft.guestCount ? String(draft.guestCount) : "—"],
  ];

  return (
    <FlowScreen title="Booking summary" subtitle="Review before payment" backHref="/venue-selection">
      {!complete ? (
        <Empty>
          Your booking is incomplete. <a href="/event-type-selection" className="underline">Start again</a>
        </Empty>
      ) : (
        <div className="space-y-3">
          {rows.map(([k, v]) => (
            <Card key={k} className="flex justify-between gap-3 text-sm">
              <span className="text-[var(--rr-text-tertiary)]">{k}</span>
              <span className="text-right text-white">{v}</span>
            </Card>
          ))}
          <Card className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[var(--rr-text-tertiary)]">Package</span><span className="text-white">{fmtMoney(draft.package?.price)}</span></div>
            {draft.customizations && draftTotal(draft) - (draft.package?.price ?? 0) > 0 ? (
              <div className="flex justify-between"><span className="text-[var(--rr-text-tertiary)]">Add-ons</span><span className="text-white">{fmtMoney(draftTotal(draft) - (draft.package?.price ?? 0))}</span></div>
            ) : null}
            {discount > 0 ? (
              <div className="flex justify-between"><span className="text-[var(--rr-text-tertiary)]">Discount ({offer?.code})</span><span className="text-[var(--rr-success)]">−{fmtMoney(discount)}</span></div>
            ) : null}
            <div className="flex justify-between border-t border-white/10 pt-2 text-base"><span className="text-white">Total</span><span className="font-semibold text-white">{fmtMoney(total)}</span></div>
          </Card>

          <div className="flex items-end gap-2">
            <Input label="Coupon code" value={code} onChange={(e) => setCodeInput(e.target.value)} placeholder="RAPID15" />
            <Button type="button" variant="outline" onClick={applyCoupon} className="shrink-0">Apply</Button>
          </div>
          {couponMsg ? <Notice tone={couponMsg.tone}>{couponMsg.text}</Notice> : null}

          <div className="space-y-2 pt-2 text-xs text-[var(--rr-text-secondary)]">
            <label className="flex items-start gap-2"><input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 accent-[var(--rr-primary)]" />I accept the <a href="/legal/terms" target="_blank" className="underline">booking terms</a>.</label>
            <label className="flex items-start gap-2"><input type="checkbox" checked={refund} onChange={(e) => setRefund(e.target.checked)} className="mt-0.5 accent-[var(--rr-primary)]" />I have read the <a href="/refund-cancellation-policy" target="_blank" className="underline">refund policy</a>.</label>
            <label className="flex items-start gap-2"><input type="checkbox" checked={rights} onChange={(e) => setRights(e.target.checked)} className="mt-0.5 accent-[var(--rr-primary)]" />I consent to my event being filmed and the footage being used to produce my reels.</label>
          </div>
          {error ? <Notice>{error}</Notice> : null}
          <Button type="button" className="w-full" disabled={busy || !terms || !refund || !rights} onClick={confirm}>
            {busy ? "Securing your date…" : `Confirm and pay ${fmtMoney(total)}`}
          </Button>
        </div>
      )}
    </FlowScreen>
  );
}
