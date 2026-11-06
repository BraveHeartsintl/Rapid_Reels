import { FlowScreen } from "@/components/layout/FlowScreen";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

function Inner() {
  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm text-[var(--rr-text-secondary)]">Amount due</p>
        <p className="text-3xl font-bold text-white">₹19,999</p>
      </Card>
      <Input label="Card number" placeholder="4242 4242 4242 4242" />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Expiry" placeholder="12/28" />
        <Input label="CVC" placeholder="123" />
      </div>
      <p className="text-xs text-[var(--rr-text-tertiary)]">
        Static demo — no charge is processed.{" "}
        <Link href="/payment-failure" className="text-[var(--rr-error)] underline">
          Simulate failure
        </Link>
      </p>
    </div>
  );
}

export default function Page() {
  return (
    <FlowScreen
      title="Payment"
      subtitle="Stripe sandbox placeholder"
      backHref="/booking-summary"
      nextHref="/payment-success"
      nextLabel="Pay now"
    >
      <Inner />
    </FlowScreen>
  );
}
