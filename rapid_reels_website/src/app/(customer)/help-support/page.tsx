import { PageHeader } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function Page() {
  return (
    <div>
      <PageHeader title="Help & support" />
      <Input label="Subject" placeholder="Booking issue" />
      <label className="mt-4 flex flex-col gap-1.5 text-sm">
        <span className="text-[var(--rr-text-secondary)]">Message</span>
        <textarea className="min-h-28 rounded-2xl border border-[var(--rr-outline)] bg-[var(--rr-surface)] px-4 py-3 text-white" />
      </label>
      <Button href="/my-tickets" className="mt-4 w-full">Submit ticket</Button>
    </div>
  );
}
