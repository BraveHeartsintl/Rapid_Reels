import { PageHeader } from "@/components/layout/FlowScreen";
import { mockTimeline } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <PageHeader title="Event timeline" />
      <ol className="space-y-4">
        {mockTimeline.map((t) => (
          <li key={t.time} className="flex gap-4">
            <span className="w-12 text-xs text-[var(--rr-secondary)]">{t.time}</span>
            <span className={t.done ? "text-[var(--rr-text-tertiary)] line-through" : "text-white"}>{t.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
