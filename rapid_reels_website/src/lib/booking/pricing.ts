import type { BookingDraft } from "@/lib/booking/draft";

/** Add-on prices per currency, in major units. GBP matches the Flutter app (package_customization_screen / booking_summary_screen). */
const ADD_ON_PRICES = {
  gbp: { reel: 20, drone: 50 },
  inr: { reel: 2000, drone: 5000 },
} as const;

function pricesFor(currency?: string) {
  return currency?.toLowerCase() === "inr" ? ADD_ON_PRICES.inr : ADD_ON_PRICES.gbp;
}

export const additionalReelPrice = (currency?: string): number => pricesFor(currency).reel;
export const dronePrice = (currency?: string): number => pricesFor(currency).drone;

export function addOnCost(
  c: { additionalReels: number; includeDrone: boolean } | undefined,
  currency?: string,
): number {
  if (!c) return 0;
  const p = pricesFor(currency);
  return c.additionalReels * p.reel + (c.includeDrone ? p.drone : 0);
}

export function draftTotal(d: BookingDraft): number {
  return (d.package?.price ?? 0) + addOnCost(d.customizations, d.currency);
}

export function draftFingerprint(d: BookingDraft): string {
  return JSON.stringify([
    d.providerId,
    d.package?.packageId,
    d.currency,
    d.customizations,
    d.eventName,
    d.eventDate,
    d.eventTime,
    d.guestCount,
    d.venue,
    d.contactPerson,
    d.contactNumber,
    d.specialRequirements,
    d.catalogueEventId,
  ]);
}
