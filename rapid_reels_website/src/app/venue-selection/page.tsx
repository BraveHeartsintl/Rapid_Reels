import { FlowScreen } from "@/components/layout/FlowScreen";
import { mockVenues } from "@/lib/mock";
import Link from "next/link";

function Inner() {
  return (
    <div className="space-y-3">
      <div className="flex h-40 items-center justify-center rounded-2xl bg-[var(--rr-surface-elevated)] text-sm text-[var(--rr-text-tertiary)]">
        Map placeholder
      </div>
      {mockVenues.map((v) => (
        <Link
          key={v}
          href="/provider-selection"
          className="block rounded-2xl border border-[var(--rr-outline)]/50 bg-[var(--rr-card)] p-4 text-sm text-white"
        >
          {v}
        </Link>
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <FlowScreen
      title="Select venue"
      subtitle="Saved addresses and map pin (static)"
      backHref="/event-details-form"
      nextHref="/provider-selection"
      nextLabel="Continue"
    >
      <Inner />
    </FlowScreen>
  );
}
