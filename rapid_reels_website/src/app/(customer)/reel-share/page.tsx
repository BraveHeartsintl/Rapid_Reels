import { PageHeader } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";

export default function Page() {
  return (
    <div>
      <PageHeader title="Share reel" subtitle="Native share sheet placeholder" />
      <div className="flex flex-col gap-2">
        <Button variant="outline">WhatsApp</Button>
        <Button variant="outline">Instagram</Button>
        <Button variant="ghost" href="/discover">Done</Button>
      </div>
    </div>
  );
}
