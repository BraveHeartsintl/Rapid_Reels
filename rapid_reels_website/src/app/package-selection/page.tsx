import { FlowScreen } from "@/components/layout/FlowScreen";
import { packages } from "@/lib/theme/tokens";
import Link from "next/link";

function Inner() {
  return (
    <div className="space-y-3">
      {packages.map((p) => (
        <Link
          key={p.id}
          href="/event-details-form"
          className="block rounded-2xl border border-[var(--rr-outline)]/50 bg-[var(--rr-card)] p-4"
        >
          <div className="flex justify-between">
            <span className="font-medium text-white">{p.name}</span>
            <span className="text-[var(--rr-secondary)]">{p.price}</span>
          </div>
          <p className="mt-1 text-xs text-[var(--rr-text-tertiary)]">{p.duration}</p>
        </Link>
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <FlowScreen
      title="Choose package"
      subtitle="Transparent pricing for your event"
      backHref="/event-type-selection"
      nextHref="/event-details-form"
      nextLabel="Continue"
    >
      <Inner />
    </FlowScreen>
  );
}
