import { PageHeader } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";
import { mockVenues } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <PageHeader title="Saved venues" />
      <div className="space-y-3">
        {mockVenues.map((v) => (
          <Card key={v}><p className="text-sm text-white">{v}</p></Card>
        ))}
      </div>
    </div>
  );
}
