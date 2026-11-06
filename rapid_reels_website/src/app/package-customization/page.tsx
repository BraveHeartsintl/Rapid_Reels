import { FlowScreen } from "@/components/layout/FlowScreen";
import { Input } from "@/components/ui/Input";

function Inner() {
  return (
    <div className="space-y-4">
      {["Drone add-on", "Extra editor", "Same-day vertical cut", "Raw footage"].map((a) => (
        <label
          key={a}
          className="flex items-center gap-3 rounded-2xl border border-[var(--rr-outline)]/50 bg-[var(--rr-card)] p-4 text-sm text-white"
        >
          <input type="checkbox" className="accent-[var(--rr-primary)]" /> {a}
        </label>
      ))}
      <Input label="Special requests" placeholder="Family entrance, cake cut…" />
    </div>
  );
}

export default function Page() {
  return (
    <FlowScreen
      title="Customize"
      subtitle="Add-ons for your booking"
      backHref="/provider-package-pick"
      nextHref="/booking-summary"
      nextLabel="Continue"
    >
      <Inner />
    </FlowScreen>
  );
}
