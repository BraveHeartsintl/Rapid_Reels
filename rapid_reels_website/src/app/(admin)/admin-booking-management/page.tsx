"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/layout/FlowScreen";
import { statusLabel, statusTone } from "@/components/booking/BookingCard";
import { Badge, Card } from "@/components/ui/Card";
import { AsyncView, Notice } from "@/components/ui/State";
import { listAllBookings, updateBooking } from "@/lib/data/queries";
import { errorMessage, fmtDate, fmtMoney, titleCase } from "@/lib/format";
import { toDate } from "@/lib/data/types";
import { useAsync } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const STATUSES = ["pending", "confirmed", "ongoing", "completed", "cancelled"];

export default function Page() {
  const state = useAsync(() => listAllBookings(500), []);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function setStatus(id: string, status: string) {
    if (!window.confirm(`Change booking status to ${status}?`)) return;
    setError(null);
    try {
      await updateBooking(id, {
        status,
        ...(status === "cancelled" ? { cancelledAt: new Date(), cancellationReason: "Cancelled by admin" } : {}),
        ...(status === "completed" ? { completedAt: new Date() } : {}),
      });
      state.reload();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <div>
      <PageHeader title="Booking management" subtitle="All bookings on the platform" />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {["all", ...STATUSES].map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={cn("rounded-full px-3 py-1 text-xs capitalize", filter === f ? "bg-[var(--rr-primary)] text-white" : "bg-[var(--rr-card)] text-[var(--rr-text-tertiary)]")}>{f}</button>
        ))}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search event or booking id" className="ml-auto rounded-2xl border border-[var(--rr-outline)] bg-[var(--rr-surface)] px-4 py-2 text-sm text-white outline-none" />
      </div>
      {error ? <Notice>{error}</Notice> : null}
      <AsyncView state={state} empty="No bookings yet.">
        {(rows) => {
          const needle = q.trim().toLowerCase();
          const filtered = rows.filter(
            (b) => (filter === "all" || b.status === filter) && (!needle || b.eventName?.toLowerCase().includes(needle) || b.id.toLowerCase().includes(needle)),
          );
          return (
            <div className="space-y-2">
              <p className="text-xs text-[var(--rr-text-tertiary)]">{filtered.length} bookings</p>
              {filtered.map((b) => (
                <Card key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">{b.eventName}</p>
                    <p className="text-xs text-[var(--rr-text-tertiary)]">{titleCase(b.eventType)} · {fmtDate(toDate(b.eventDate))} · {b.venue?.city}</p>
                    <p className="text-xs text-[var(--rr-text-tertiary)]">{fmtMoney(b.payment?.totalAmount, b.payment?.currency)} · {titleCase(b.payment?.paymentStatus)} · #{b.id.slice(0, 8)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={statusTone(b.status)}>{statusLabel(b.status)}</Badge>
                    <select
                      value={b.status}
                      onChange={(e) => setStatus(b.id, e.target.value)}
                      className="rounded-lg border border-[var(--rr-outline)] bg-[var(--rr-surface)] px-2 py-1 text-xs text-white"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
                    </select>
                    <Link href={`/admin-booking-drive?id=${b.id}`} className="text-xs text-[var(--rr-secondary)]">Drive</Link>
                  </div>
                </Card>
              ))}
            </div>
          );
        }}
      </AsyncView>
    </div>
  );
}
