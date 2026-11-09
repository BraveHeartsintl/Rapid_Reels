"use client";

import { useState } from "react";
import { FlowScreen } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { AsyncView, Empty, Notice } from "@/components/ui/State";
import { getBooking, updateBooking } from "@/lib/data/queries";
import { errorMessage } from "@/lib/format";
import { useAsync, useQuery } from "@/lib/hooks";

const ITEMS: Array<[string, string]> = [
  ["equipmentCharged", "Cameras, batteries and lights charged"],
  ["cardsFormatted", "Memory cards formatted and spares packed"],
  ["momentsReviewed", "Key moments reviewed with the customer"],
  ["venueChecked", "Venue address and access confirmed"],
  ["customerContacted", "Customer contacted to confirm arrival time"],
  ["backupGear", "Backup camera and audio gear packed"],
];

export default function Page() {
  const query = useQuery();
  const id = query.get("id");
  const state = useAsync(() => getBooking(id!), [id], query.ready && Boolean(id));
  const [error, setError] = useState<string | null>(null);
  const [local, setLocal] = useState<Record<string, boolean>>({});

  async function toggle(key: string, value: boolean) {
    if (!id) return;
    setLocal((s) => ({ ...s, [key]: value }));
    setError(null);
    try {
      await updateBooking(id, { [`metadata.checklist.${key}`]: value });
    } catch (e) {
      setLocal((s) => ({ ...s, [key]: !value }));
      setError(errorMessage(e));
    }
  }

  return (
    <FlowScreen title="Pre-event checklist" subtitle="Be ready before you arrive" backHref={id ? `/provider-booking-status?id=${id}` : "/provider-bookings"}>
      {query.ready && !id ? (
        <Empty>No booking selected. <a href="/provider-bookings" className="underline">All bookings</a></Empty>
      ) : (
        <AsyncView state={state} empty="Booking not found." isEmpty={(d) => d === null}>
          {(b) => {
            if (!b) return null;
            const saved = ((b.metadata as { checklist?: Record<string, boolean> } | null)?.checklist ?? {}) as Record<string, boolean>;
            const get = (k: string) => local[k] ?? Boolean(saved[k]);
            return (
              <div className="space-y-3">
                {ITEMS.map(([key, label]) => (
                  <label key={key} className="flex items-center gap-3 rounded-2xl border border-[var(--rr-outline)]/50 bg-[var(--rr-card)] p-4 text-sm text-white">
                    <input type="checkbox" className="accent-[var(--rr-primary)]" checked={get(key)} onChange={(e) => toggle(key, e.target.checked)} />
                    {label}
                  </label>
                ))}
                {error ? <Notice>{error}</Notice> : null}
                <Button href={`/provider-booking-status?id=${b.id}`} className="w-full">Back to booking</Button>
              </div>
            );
          }}
        </AsyncView>
      )}
    </FlowScreen>
  );
}
