"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlowScreen } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Empty } from "@/components/ui/State";
import { saveDraft, useBookingDraft } from "@/lib/booking/draft";
import { ADDITIONAL_REEL_PRICE, DRONE_PRICE, addOnCost } from "@/lib/booking/pricing";
import { fmtMoney } from "@/lib/format";

const STYLES = ["Cinematic", "Trendy", "Classic", "Minimal"];
const MUSIC = ["Upbeat", "Romantic", "Acoustic", "Electronic", "Instrumental"];
const GRADING = ["Natural", "Warm", "Cool", "Vintage"];

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-[var(--rr-text-secondary)]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-2xl border border-[var(--rr-outline)] bg-[var(--rr-surface)] px-4 py-3 text-[var(--rr-text)] outline-none focus:border-[var(--rr-primary)]"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function Page() {
  const router = useRouter();
  const draft = useBookingDraft();
  const [touched, setTouched] = useState<{
    editingStyle?: string;
    musicPreference?: string;
    colorGrading?: string;
    includeDrone?: boolean;
    additionalReels?: number;
  }>({});

  const current = {
    editingStyle: touched.editingStyle ?? draft.customizations?.editingStyle ?? draft.package?.editingStyle ?? STYLES[0],
    musicPreference: touched.musicPreference ?? draft.customizations?.musicPreference ?? MUSIC[0],
    colorGrading: touched.colorGrading ?? draft.customizations?.colorGrading ?? GRADING[0],
    includeDrone: touched.includeDrone ?? draft.customizations?.includeDrone ?? false,
    additionalReels: touched.additionalReels ?? draft.customizations?.additionalReels ?? 0,
  };
  const extra = addOnCost(current);
  const styleOptions = STYLES.includes(current.editingStyle) ? STYLES : [current.editingStyle, ...STYLES];

  return (
    <FlowScreen title="Customize" subtitle="Add-ons for your booking" backHref="/provider-package-pick">
      {!draft.package ? (
        <Empty>
          Choose a package first. <a href="/provider-package-pick" className="underline">Pick package</a>
        </Empty>
      ) : (
        <div className="space-y-4">
          <Card className="flex justify-between text-sm">
            <span className="text-[var(--rr-text-secondary)]">{draft.package.name}</span>
            <span className="text-white">{fmtMoney(draft.package.price)}</span>
          </Card>
          <Select label="Editing style" value={current.editingStyle} options={styleOptions} onChange={(v) => setTouched((t) => ({ ...t, editingStyle: v }))} />
          <Select label="Music" value={current.musicPreference} options={MUSIC} onChange={(v) => setTouched((t) => ({ ...t, musicPreference: v }))} />
          <Select label="Colour grading" value={current.colorGrading} options={GRADING} onChange={(v) => setTouched((t) => ({ ...t, colorGrading: v }))} />
          <label className="flex items-center gap-3 rounded-2xl border border-[var(--rr-outline)]/50 bg-[var(--rr-card)] p-4 text-sm text-white">
            <input
              type="checkbox"
              className="accent-[var(--rr-primary)]"
              checked={current.includeDrone}
              onChange={(e) => setTouched((t) => ({ ...t, includeDrone: e.target.checked }))}
            />
            Drone coverage (+{fmtMoney(DRONE_PRICE)})
          </label>
          <div className="flex items-center justify-between rounded-2xl border border-[var(--rr-outline)]/50 bg-[var(--rr-card)] p-4 text-sm text-white">
            <span>Extra reels (+{fmtMoney(ADDITIONAL_REEL_PRICE)} each)</span>
            <span className="flex items-center gap-3">
              <button type="button" aria-label="Fewer reels" className="h-8 w-8 rounded-full bg-white/10" onClick={() => setTouched((t) => ({ ...t, additionalReels: Math.max(0, current.additionalReels - 1) }))}>−</button>
              <span>{current.additionalReels}</span>
              <button type="button" aria-label="More reels" className="h-8 w-8 rounded-full bg-white/10" onClick={() => setTouched((t) => ({ ...t, additionalReels: Math.min(20, current.additionalReels + 1) }))}>+</button>
            </span>
          </div>
          <Card className="flex justify-between text-sm">
            <span className="text-[var(--rr-text-secondary)]">Total</span>
            <span className="font-semibold text-white">{fmtMoney(draft.package.price + extra)}</span>
          </Card>
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              saveDraft({ customizations: { ...current, additionalCost: extra } });
              router.push("/event-details-form");
            }}
          >
            Continue
          </Button>
        </div>
      )}
    </FlowScreen>
  );
}
