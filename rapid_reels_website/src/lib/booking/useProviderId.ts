"use client";

import { useBookingDraft } from "@/lib/booking/draft";
import { useQuery } from "@/lib/hooks";

/** Provider for the current booking-flow page: `?id=` wins, then the saved draft. */
export function useProviderId(): { ready: boolean; providerId: string | null } {
  const query = useQuery();
  const draft = useBookingDraft();
  return {
    ready: query.ready,
    providerId: query.get("id") ?? draft.providerId ?? null,
  };
}
