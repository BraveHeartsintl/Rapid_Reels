import { FlowScreen } from "@/components/layout/FlowScreen";
import { mockProviders } from "@/lib/mock";
import Link from "next/link";
import { Badge } from "@/components/ui/Card";

function Inner() {
  return (
    <div className="space-y-3">
      {mockProviders.map((p) => (
        <Link
          key={p.id}
          href={"/provider-details?id=" + p.id}
          className="block rounded-2xl border border-[var(--rr-outline)]/50 bg-[var(--rr-card)] p-4"
        >
          <div className="flex justify-between gap-2">
            <div>
              <p className="font-medium text-white">{p.name}</p>
              <p className="text-xs text-[var(--rr-text-tertiary)]">
                ★ {p.rating} · from {p.priceFrom}
              </p>
            </div>
            {p.verified ? <Badge tone="success">Verified</Badge> : null}
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <FlowScreen
      title="Choose provider"
      subtitle="Verified creators in your city"
      backHref="/venue-selection"
      nextHref="/provider-details"
      nextLabel="Continue"
    >
      <Inner />
    </FlowScreen>
  );
}
