import type { BookingDraft } from "@/lib/booking/draft";

export const ADDITIONAL_REEL_PRICE = 20;
export const DRONE_PRICE = 50;

/** Same add-on pricing as the Flutter app (package_customization_screen / booking_summary_screen). */
export function addOnCost(c: { additionalReels: number; includeDrone: boolean } | undefined): number {
  if (!c) return 0;
  return c.additionalReels * ADDITIONAL_REEL_PRICE + (c.includeDrone ? DRONE_PRICE : 0);
}

export function draftTotal(d: BookingDraft): number {
  return (d.package?.price ?? 0) + addOnCost(d.customizations);
}

export function draftFingerprint(d: BookingDraft): string {
  return JSON.stringify([
    d.providerId,
    d.package?.packageId,
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
