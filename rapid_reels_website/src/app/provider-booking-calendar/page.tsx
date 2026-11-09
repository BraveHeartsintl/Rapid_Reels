"use client";

import Link from "next/link";
import { useState } from "react";
import { FlowScreen } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";
import { AsyncView } from "@/components/ui/State";
import { useUid } from "@/lib/auth/useUid";
import { listProviderBookings } from "@/lib/data/queries";
import { dateKeyLocal } from "@/lib/format";
import { useAsync } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Page() {
  const uid = useUid();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const state = useAsync(() => listProviderBookings(uid!), [uid], Boolean(uid));

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const title = cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  return (
    <FlowScreen title="Booking calendar" subtitle="Your events by date" backHref="/provider-dashboard">
      <div className="mb-3 flex items-center justify-between text-white">
        <button type="button" className="px-3 py-1" onClick={() => setCursor(new Date(year, month - 1, 1))}>‹</button>
        <span className="text-sm font-medium">{title}</span>
        <button type="button" className="px-3 py-1" onClick={() => setCursor(new Date(year, month + 1, 1))}>›</button>
      </div>
      <AsyncView state={state} empty="No bookings yet." isEmpty={() => false}>
        {(rows) => {
          const active = rows.filter((b) => b.status !== "cancelled");
          const byDay = new Map<string, typeof active>();
          for (const b of active) {
            if (!b.eventDateKey) continue;
            byDay.set(b.eventDateKey, [...(byDay.get(b.eventDateKey) ?? []), b]);
          }
          const cells: Array<number | null> = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
          const monthPrefix = dateKeyLocal(new Date(year, month, 1)).slice(0, 7);
          const monthBookings = active
            .filter((b) => b.eventDateKey?.startsWith(monthPrefix))
            .sort((a, b) => (a.eventDateKey ?? "").localeCompare(b.eventDateKey ?? ""));
          return (
            <div className="space-y-5">
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {DOW.map((d) => (
                  <span key={d} className="py-1 text-[var(--rr-text-tertiary)]">{d}</span>
                ))}
                {cells.map((day, i) => {
                  if (!day) return <span key={`e${i}`} />;
                  const key = dateKeyLocal(new Date(year, month, day));
                  const items = byDay.get(key);
                  return (
                    <span
                      key={key}
                      className={cn(
                        "flex aspect-square items-center justify-center rounded-xl text-sm",
                        items ? "bg-[var(--rr-primary)] font-semibold text-white" : "bg-[var(--rr-card)] text-[var(--rr-text-secondary)]",
                      )}
                    >
                      {day}
                    </span>
                  );
                })}
              </div>
              <section className="space-y-2">
                <h2 className="text-sm font-semibold text-[var(--rr-text-secondary)]">This month</h2>
                {monthBookings.length === 0 ? (
                  <p className="text-sm text-[var(--rr-text-tertiary)]">No events this month.</p>
                ) : (
                  monthBookings.map((b) => (
                    <Link key={b.id} href={`/provider-booking-status?id=${b.id}`}>
                      <Card className="mb-2 flex justify-between py-3 text-sm">
                        <span className="text-white">{b.eventName}</span>
                        <span className="text-[var(--rr-text-tertiary)]">{b.eventDateKey?.slice(8)} · {b.eventTime}</span>
                      </Card>
                    </Link>
                  ))
                )}
              </section>
            </div>
          );
        }}
      </AsyncView>
    </FlowScreen>
  );
}
