"use client";

import { Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlowScreen } from "@/components/layout/FlowScreen";
import { statusLabel, statusTone } from "@/components/booking/BookingCard";
import { BookingPicker } from "@/components/provider/BookingPicker";
import { Button } from "@/components/ui/Button";
import { Badge, Card } from "@/components/ui/Card";
import { AsyncView, Notice } from "@/components/ui/State";
import { getBooking, saveLiveEvent, updateBooking } from "@/lib/data/queries";
import { toDate, type BookingDoc, type WithId } from "@/lib/data/types";
import { errorMessage } from "@/lib/format";
import { useAsync, useQuery } from "@/lib/hooks";

function clock(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${ss}`;
}

function LivePanel({ booking, reload }: { booking: WithId<BookingDoc>; reload: () => void }) {
  const moments = booking.keyMoments ?? [];
  const meta = (booking.metadata ?? {}) as { capturedMoments?: string[] };
  const [captured, setCaptured] = useState<string[]>(meta.capturedMoments ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const started = toDate(booking.eventStatus?.eventStarted);

  useEffect(() => {
    if (booking.status !== "ongoing") return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [booking.status]);

  /** Mirrors progress into `live_events` so the customer's live tracker updates. Providers can only update an existing document, so failures are ignored. */
  async function syncLive(status: string, done: string[], startedAt: Date | null) {
    try {
      await saveLiveEvent(booking.id, {
        providerId: booking.providerId,
        customerId: booking.customerId,
        status,
        startedAt: startedAt ? Timestamp.fromDate(startedAt) : null,
        progress: {
          keyMomentsCaptured: done.length,
          totalKeyMoments: moments.length,
          coveragePercentage: moments.length ? Math.round((done.length / moments.length) * 100) : 0,
          expectedReels: booking.expectedReelsCount ?? 0,
        },
        milestones: moments.map((m, i) => ({ milestoneId: String(i), name: m, isCaptured: done.includes(m) })),
      });
    } catch {
      /* live_events creation is restricted by security rules */
    }
  }

  async function run(patch: Record<string, unknown>, status: string) {
    setBusy(true);
    setError(null);
    try {
      await updateBooking(booking.id, patch);
      await syncLive(status, captured, started ?? new Date());
      reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function toggle(moment: string) {
    const next = captured.includes(moment) ? captured.filter((m) => m !== moment) : [...captured, moment];
    const prev = captured;
    setCaptured(next);
    try {
      await updateBooking(booking.id, { "metadata.capturedMoments": next });
      await syncLive("live", next, started);
    } catch (e) {
      setCaptured(prev);
      setError(errorMessage(e));
    }
  }

  const percent = moments.length ? Math.round((captured.length / moments.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <Card className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-white">{booking.eventName}</p>
          <Badge tone={statusTone(booking.status)}>{statusLabel(booking.status)}</Badge>
        </div>
        {booking.status === "ongoing" && started ? (
          <p className="text-3xl font-semibold tabular-nums text-white">{clock(now - started.getTime())}</p>
        ) : null}
      </Card>

      {error ? <Notice>{error}</Notice> : null}

      {booking.status === "confirmed" ? (
        <Button type="button" className="w-full" disabled={busy} onClick={() => run({ status: "ongoing", "eventStatus.eventStarted": new Date() }, "live")}>
          Start event
        </Button>
      ) : null}
      {booking.status === "pending" ? <Notice>Accept this booking before going live.</Notice> : null}

      {booking.status === "ongoing" || booking.status === "completed" ? (
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--rr-text-secondary)]">Key moments</h2>
            <span className="text-xs text-[var(--rr-text-tertiary)]">{captured.length}/{moments.length} · {percent}%</span>
          </div>
          {moments.length === 0 ? (
            <p className="text-xs text-[var(--rr-text-tertiary)]">The customer did not list specific moments.</p>
          ) : (
            moments.map((m) => (
              <label key={m} className="flex items-center gap-3 rounded-2xl bg-[var(--rr-card)] px-4 py-3 text-sm text-white">
                <input type="checkbox" className="accent-[var(--rr-primary)]" checked={captured.includes(m)} disabled={booking.status !== "ongoing"} onChange={() => toggle(m)} />
                {m}
              </label>
            ))
          )}
        </section>
      ) : null}

      {booking.status === "ongoing" ? (
        <Button type="button" variant="danger" className="w-full" disabled={busy} onClick={() => run({ status: "completed", completedAt: new Date(), "eventStatus.eventCompleted": new Date() }, "completed")}>
          End event
        </Button>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <Button href={`/upload-footage?id=${booking.id}`} variant="outline">Upload footage</Button>
        <Button href={`/provider-portfolio-upload?id=${booking.id}`} variant="outline">Deliver reel</Button>
      </div>
    </div>
  );
}

export default function Page() {
  const query = useQuery();
  const id = query.get("id");
  const state = useAsync(() => getBooking(id!), [id], query.ready && Boolean(id));

  return (
    <FlowScreen title="Live event mode" subtitle="Run the event and track key moments" backHref={id ? `/provider-booking-status?id=${id}` : "/provider-dashboard"}>
      {!query.ready ? null : id ? (
        <AsyncView state={state} empty="Booking not found." isEmpty={(d) => d === null}>
          {(b) => (b ? <LivePanel key={`${b.id}-${b.status}`} booking={b} reload={state.reload} /> : null)}
        </AsyncView>
      ) : (
        <BookingPicker statuses={["confirmed", "ongoing"]} hrefFor={(b) => `/live-event-mode?id=${b}`} empty="No confirmed or ongoing events right now." />
      )}
    </FlowScreen>
  );
}
