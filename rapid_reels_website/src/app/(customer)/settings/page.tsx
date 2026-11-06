import { PageHeader } from "@/components/layout/FlowScreen";
import Link from "next/link";

const items = [
  ["/payment-methods", "Payment methods"],
  ["/cookie-preferences", "Cookie preferences"],
  ["/legal/terms", "Terms & privacy"],
  ["/help-support", "Help & support"],
];

export default function Page() {
  return (
    <div>
      <PageHeader title="Settings" />
      <div className="space-y-2">
        {items.map(([href, label]) => (
          <Link key={href} href={href} className="flex justify-between rounded-2xl bg-[var(--rr-card)] px-4 py-3 text-sm text-white">
            {label}<span className="text-[var(--rr-text-tertiary)]">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
