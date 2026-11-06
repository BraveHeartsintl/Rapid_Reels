import { PageHeader } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function Page() {
  return (
    <div>
      <PageHeader title="Redeem wallet" />
      <Input label="Amount" type="number" defaultValue="500" />
      <Button href="/wallet" className="mt-4 w-full">Apply to next booking</Button>
    </div>
  );
}
