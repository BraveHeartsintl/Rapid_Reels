import { FlowScreen } from "@/components/layout/FlowScreen";
import { packages } from "@/lib/theme/tokens";
import Link from "next/link";

function Inner() {
  return (
    <div className="space-y-3">
      {packages.map((p) => (
        <Link
          key={p.id}
          href="/package-customization"
          className="block rounded-2xl border border-[var(--rr-outline)]/50 bg-[var(--rr-card)] p-4"
        >
          <p className="font-medium text-white">{p.name}</p>
          <p className="text-sm text-[var(--rr-secondary)]">{p.price}</p>
        </Link>
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <FlowScreen
      title="Provider package"
      subtitle="Confirm package tier with this studio"
      backHref="/catalogue-selection"
      nextHref="/package-customization"
      nextLabel="Continue"
    >
      <Inner />
    </FlowScreen>
  );
}
