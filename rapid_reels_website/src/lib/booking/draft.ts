"use client";

import { useSyncExternalStore } from "react";

/** In-progress booking, persisted in localStorage between the booking-flow pages. */
export interface BookingDraft {
  eventType?: string;
  city?: string;
  providerId?: string;
  providerName?: string;
  catalogueEventId?: string;
  catalogueTitle?: string;
  catalogueHeroUrl?: string;
  cataloguePackageIds?: string[];
  package?: {
    packageId: string;
    name: string;
    price: number;
    duration: number;
    reelsCount: number;
    editingStyle: string;
    deliveryTime: number;
    features: string[];
  };
  customizations?: {
    editingStyle: string;
    musicPreference: string;
    colorGrading: string;
    includeDrone: boolean;
    additionalReels: number;
    additionalCost: number;
  };
  eventName?: string;
  eventDate?: string; // yyyy-MM-dd
  eventTime?: string; // HH:mm
  guestCount?: number;
  contactPerson?: string;
  contactNumber?: string;
  specialRequirements?: string;
  keyMoments?: string[];
  venue?: { name: string; address: string; city: string; pincode: string };
  currency?: string;
  couponCode?: string;
  /** Set once the booking document exists, so a back-navigation does not create a duplicate. */
  bookingId?: string;
  bookingFingerprint?: string;
}

const KEY = "rr_booking_draft";
const EMPTY: BookingDraft = {};
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedValue: BookingDraft = EMPTY;

function read(): BookingDraft {
  const raw = window.localStorage.getItem(KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedValue = raw ? (JSON.parse(raw) as BookingDraft) : EMPTY;
    } catch {
      cachedValue = EMPTY;
    }
  }
  return cachedValue;
}

function emit() {
  listeners.forEach((l) => l());
}

export function saveDraft(patch: Partial<BookingDraft>): void {
  const next = { ...read(), ...patch };
  window.localStorage.setItem(KEY, JSON.stringify(next));
  emit();
}

export function clearDraft(): void {
  window.localStorage.removeItem(KEY);
  emit();
}

export function useBookingDraft(): BookingDraft {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => EMPTY,
  );
}
