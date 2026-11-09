"use client";

import { useRouter } from "next/navigation";
import { FlowScreen } from "@/components/layout/FlowScreen";
import { saveDraft, useBookingDraft } from "@/lib/booking/draft";
import { EVENT_TYPES } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function Page() {
  const router = useRouter();
  const draft = useBookingDraft();

  return (
    <FlowScreen title="Select event type" subtitle="What are you celebrating?" backHref="/home">
      <div className="grid gap-3">
        {EVENT_TYPES.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => {
              saveDraft({ eventType: e.id });
              router.push("/provider-selection");
            }}
            className={cn(
              "flex items-center gap-3 rounded-2xl border bg-[var(--rr-card)] p-4 text-left",
              draft.eventType === e.id ? "border-[var(--rr-primary)]" : "border-[var(--rr-outline)]/50",
            )}
          >
            <span className="h-3 w-3 rounded-full" style={{ background: e.color }} />
            <span className="font-medium text-white">{e.label}</span>
          </button>
        ))}
      </div>
    </FlowScreen>
  );
}
