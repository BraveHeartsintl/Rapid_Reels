"use client";

import { useEffect, useState } from "react";
import { Badge, Card } from "@/components/ui/Card";
import { Empty, ErrorState, Loading } from "@/components/ui/State";
import { subscribeLiveEvent } from "@/lib/data/queries";
import type { LiveEventDoc, WithId } from "@/lib/data/types";
import { fmtDateTime, titleCase } from "@/lib/format";

/** Real-time view of `live_events/{bookingId}`. */
export function LiveEventView({ bookingId }: { bookingId: string }) {
  const [event, setEvent] = useState<WithId<LiveEventDoc> | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return subscribeLiveEvent(bookingId, setEvent, (e) => setError(e.message));
  }, [bookingId]);

  if (error) return <ErrorState message={error} />;
  if (event === undefined) return <Loading />;
  if (event === null) return <Empty>The live event has not started yet. This page updates automatically.</Empty>;

  const p = event.progress ?? {};
  const live = event.status === "live" || event.status === "in_progress" || event.status === "ongoing";
  return (
    <div className="space-y-4">
      <Card className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--rr-text-secondary)]">Status</p>
          <p className="mt-1 text-white">{titleCase(event.status)}</p>
          {event.startedAt ? <p className="text-xs text-[var(--rr-text-tertiary)]">Started {fmtDateTime(event.startedAt)}</p> : null}
        </div>
        <Badge tone={live ? "warning" : "muted"}>{live ? "LIVE" : titleCase(event.status)}</Badge>
      </Card>

      <Card>
        <p className="text-sm text-[var(--rr-text-secondary)]">Coverage</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-[var(--rr-primary)]" style={{ width: `${Math.min(100, p.coveragePercentage ?? 0)}%` }} />
        </div>
        <p className="mt-2 text-xs text-[var(--rr-text-tertiary)]">
          {p.keyMomentsCaptured ?? 0}/{p.totalKeyMoments ?? 0} key moments · {p.reelsDelivered ?? 0}/{p.expectedReels ?? 0} reels delivered
          {p.currentPhase ? ` · ${p.currentPhase}` : ""}
        </p>
      </Card>

      {event.milestones?.length ? (
        <Card>
          <p className="mb-2 text-sm text-[var(--rr-text-secondary)]">Milestones</p>
          <ul className="space-y-2 text-sm">
            {event.milestones.map((m) => (
              <li key={m.milestoneId} className={m.isCaptured ? "text-[var(--rr-text-tertiary)] line-through" : "text-white"}>
                {m.name}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {event.reelDeliveries?.length ? (
        <Card>
          <p className="mb-2 text-sm text-[var(--rr-text-secondary)]">Delivered reels</p>
          <ul className="space-y-2 text-sm">
            {event.reelDeliveries.map((r) => (
              <li key={r.reelId} className="flex justify-between">
                <a href={`/reel-player?id=${r.reelId}`} className="text-[var(--rr-secondary)]">{r.title || "Reel"} →</a>
                <span className="text-xs text-[var(--rr-text-tertiary)]">{fmtDateTime(r.deliveredAt)}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
