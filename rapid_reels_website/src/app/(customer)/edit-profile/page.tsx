import { PageHeader } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { mockUser } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <PageHeader title="Edit profile" />
      <div className="space-y-4">
        <Input label="Full name" defaultValue={mockUser.name} />
        <Input label="Email" defaultValue={mockUser.email} />
        <Input label="Phone" defaultValue={mockUser.phone} />
        <Button href="/profile" className="w-full">Save (static)</Button>
      </div>
    </div>
  );
}
