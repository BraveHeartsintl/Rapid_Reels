import { PageHeader } from "@/components/layout/FlowScreen";
import { Badge, Card } from "@/components/ui/Card";

export default function Page() {
  return (
    <div>
      <PageHeader title="My tickets" />
      <Card className="flex justify-between">
        <div>
          <p className="text-sm text-white">Payment receipt missing</p>
          <p className="text-xs text-[var(--rr-text-tertiary)]">#T-1042</p>
        </div>
        <Badge tone="warning">Open</Badge>
      </Card>
    </div>
  );
}
