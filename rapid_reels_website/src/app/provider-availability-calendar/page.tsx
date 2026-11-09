"use client";

import { Timestamp } from "firebase/firestore";
import { useState } from "react";
import { FlowScreen } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { AsyncView, Notice } from "@/components/ui/State";
import { useProviderDoc } from "@/lib/auth/useProviderDoc";
import { updateProvider } from "@/lib/data/queries";
import { toDate, type ProviderDoc } from "@/lib/data/types";
import { dateKeyLocal, errorMessage } from "@/lib/format";

const DAYS: Array<[string, string]> = [
  ["monday", "Monday"],
  ["tuesday", "Tuesday"],
  ["wednesday", "Wednesday"],
  ["thursday", "Thursday"],
  ["friday", "Friday"],
  ["saturday", "Saturday"],
  ["sunday", "Sunday"],
];

type Day = { isOpen: boolean; startTime: string; endTime: string };

function initialWeek(p: ProviderDoc): Record<string, Day> {
  const out: Record<string, Day> = {};
  for (const [key] of DAYS) {
    const d = p.availability?.[key];
    const slot = d?.slots?.[0];
    out[key] = { isOpen: d?.isOpen ?? true, startTime: slot?.startTime ?? "09:00", endTime: slot?.endTime ?? "18:00" };
  }
  return out;
}

function AvailabilityForm({ uid, provider }: { uid: string; provider: ProviderDoc }) {
  const [week, setWeek] = useState(() => initialWeek(provider));
  const [blocked, setBlocked] = useState<string[]>(() =>
    (provider.blockedDates ?? [])
      .map((b) => (typeof b.date === "string" ? b.date.slice(0, 10) : dateKeyLocal(toDate(b.date) ?? new Date())))
      .sort(),
  );
  const [newDate, setNewDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  function patchDay(key: string, patch: Partial<Day>) {
    setWeek((w) => ({ ...w, [key]: { ...w[key], ...patch } }));
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const availability: Record<string, unknown> = {};
      for (const [key] of DAYS) {
        const d = week[key];
        availability[key] = {
          isOpen: d.isOpen,
          slots: d.isOpen ? [{ startTime: d.startTime, endTime: d.endTime, slotDuration: 60 }] : [],
        };
      }
      const blockedDates = blocked.map((k) => {
        const [y, m, day] = k.split("-").map(Number);
        return { date: Timestamp.fromDate(new Date(y, m - 1, day)), reason: "unavailable", bookingId: null };
      });
      await updateProvider(uid, { availability, blockedDates });
      setMsg({ tone: "success", text: "Availability saved." });
    } catch (e) {
      setMsg({ tone: "error", text: errorMessage(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-[var(--rr-text-secondary)]">Weekly hours</h2>
        {DAYS.map(([key, label]) => {
          const d = week[key];
          return (
            <div key={key} className="flex items-center gap-3 rounded-2xl bg-[var(--rr-card)] px-4 py-3 text-sm">
              <label className="flex w-28 items-center gap-2 text-white">
                <input type="checkbox" className="accent-[var(--rr-primary)]" checked={d.isOpen} onChange={(e) => patchDay(key, { isOpen: e.target.checked })} />
                {label}
              </label>
              {d.isOpen ? (
                <div className="flex items-center gap-2 text-[var(--rr-text-secondary)]">
                  <input type="time" value={d.startTime} onChange={(e) => patchDay(key, { startTime: e.target.value })} className="rounded-lg bg-[var(--rr-surface)] px-2 py-1" />
                  –
                  <input type="time" value={d.endTime} onChange={(e) => patchDay(key, { endTime: e.target.value })} className="rounded-lg bg-[var(--rr-surface)] px-2 py-1" />
                </div>
              ) : (
                <span className="text-[var(--rr-text-tertiary)]">Closed</span>
              )}
            </div>
          );
        })}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-[var(--rr-text-secondary)]">Blocked dates</h2>
        <div className="flex gap-2">
          <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="flex-1 rounded-2xl border border-[var(--rr-outline)] bg-[var(--rr-surface)] px-4 py-3 text-sm text-white" />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (newDate && !blocked.includes(newDate)) setBlocked((b) => [...b, newDate].sort());
              setNewDate("");
            }}
          >
            Block
          </Button>
        </div>
        {blocked.length === 0 ? (
          <p className="text-xs text-[var(--rr-text-tertiary)]">No blocked dates.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {blocked.map((k) => (
              <button key={k} type="button" onClick={() => setBlocked((b) => b.filter((x) => x !== k))} className="rounded-full bg-[var(--rr-card)] px-3 py-1 text-xs text-white">
                {k} ✕
              </button>
            ))}
          </div>
        )}
      </section>

      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
      <Button type="button" className="w-full" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save availability"}</Button>
    </div>
  );
}

export default function Page() {
  const state = useProviderDoc();
  return (
    <FlowScreen title="Availability" subtitle="Weekly hours and days off" backHref="/provider-dashboard">
      <AsyncView state={state} empty="Provider profile not found." isEmpty={(d) => !d}>
        {(p) => <AvailabilityForm uid={state.uid!} provider={p} />}
      </AsyncView>
    </FlowScreen>
  );
}
