import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockEarnings } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-white">Earnings</h1>
      <div className="grid gap-3 sm:grid-cols-4">
        {mockEarnings.map((e) => (
          <Card key={e.month}>
            <p className="text-xs text-[var(--rr-text-tertiary)]">{e.month}</p>
            <p className="mt-2 text-xl font-semibold text-white">₹{e.amount.toLocaleString()}</p>
          </Card>
        ))}
      </div>
      <Button href="/provider-bank-details" className="mt-6" variant="outline">Bank details</Button>
    </div>
  );
}
