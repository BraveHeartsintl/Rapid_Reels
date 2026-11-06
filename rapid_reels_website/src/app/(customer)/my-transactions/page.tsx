import { PageHeader } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";
import { mockTransactions } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <PageHeader title="Transactions" />
      {mockTransactions.map((t) => (
        <Card key={t.id} className="mb-2 flex justify-between text-sm">
          <div>
            <p className="text-white">{t.label}</p>
            <p className="text-xs text-[var(--rr-text-tertiary)]">{t.date}</p>
          </div>
          <span className="text-white">₹{Math.abs(t.amount)}</span>
        </Card>
      ))}
    </div>
  );
}
