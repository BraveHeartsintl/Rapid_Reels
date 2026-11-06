import { FlowScreen } from "@/components/layout/FlowScreen";
import { eventTypes } from "@/lib/mock";
import Link from "next/link";

function Inner() {
  return (
    <div className="grid gap-3">
      {eventTypes.map((e) => (
        <Link
          key={e.id}
          href="/package-selection"
          className="flex items-center gap-3 rounded-2xl border border-[var(--rr-outline)]/50 bg-[var(--rr-card)] p-4"
        >
          <span className="h-3 w-3 rounded-full" style={{ background: e.color }} />
          <span className="font-medium text-white">{e.label}</span>
        </Link>
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <FlowScreen
      title="Select event type"
      subtitle="What are you celebrating?"
      backHref="/home"
      nextHref="/package-selection"
      nextLabel="Continue"
    >
      <Inner />
    </FlowScreen>
  );
}
