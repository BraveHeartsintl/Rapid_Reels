import { FlowScreen } from "@/components/layout/FlowScreen";
import { mockProviders } from "@/lib/mock";
import { Badge, Card } from "@/components/ui/Card";

const p = mockProviders[0];

function Inner() {
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex justify-between">
          <h2 className="text-lg font-semibold text-white">{p.name}</h2>
          {p.verified ? <Badge tone="success">Verified</Badge> : null}
        </div>
        <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">
          ★ {p.rating} ({p.reviews} reviews) · {p.city}
        </p>
        <p className="mt-2 text-sm text-[var(--rr-text-tertiary)]">
          {p.specialties.join(" · ")}
        </p>
      </Card>
      <Card>
        <p className="text-sm text-[var(--rr-text-secondary)]">About</p>
        <p className="mt-2 text-sm text-white">
          Cinematic event storytelling with same-day social cuts.
        </p>
      </Card>
    </div>
  );
}

export default function Page() {
  return (
    <FlowScreen
      title="Provider details"
      subtitle="Portfolio, reviews, and offerings"
      backHref="/provider-selection"
      nextHref="/provider-portfolio"
      nextLabel="Continue"
    >
      <Inner />
    </FlowScreen>
  );
}
