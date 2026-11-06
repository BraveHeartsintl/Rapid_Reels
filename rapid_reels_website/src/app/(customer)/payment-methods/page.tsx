import { PageHeader } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";

export default function Page() {
  return (
    <div>
      <PageHeader title="Payment methods" />
      <Card className="mb-3 text-sm text-white">Visa ···· 4242</Card>
      <Card className="text-sm text-white">UPI · aisha@oksbi</Card>
    </div>
  );
}
