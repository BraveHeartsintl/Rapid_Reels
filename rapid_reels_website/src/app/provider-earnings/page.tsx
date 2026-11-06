import { FlowScreen } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function Page() {
  return (
    <FlowScreen
      title="Earnings detail"
      subtitle="Static provider flow demo"
      backHref="/provider-portal/demo/account"
      nextHref="/provider-portal/demo/earnings"
      nextLabel="Continue"
    >
      <div className="space-y-4">
        <Card>
          <p className="text-sm text-[var(--rr-text-secondary)]">
            Earnings detail screen with mock controls. No uploads or API calls in this phase.
          </p>
        </Card>
        <Input label="Notes" placeholder="Optional notes for this step" />
        <label className="flex items-center gap-3 rounded-2xl border border-[var(--rr-outline)]/50 bg-[var(--rr-card)] p-4 text-sm text-white">
          <input type="checkbox" className="accent-[var(--rr-primary)]" defaultChecked /> Mark step complete
        </label>
      </div>
    </FlowScreen>
  );
}
