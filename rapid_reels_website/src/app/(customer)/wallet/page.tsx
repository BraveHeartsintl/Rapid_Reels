import { PageHeader } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockTransactions, mockUser } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <PageHeader title="Wallet" subtitle="Balance and history" />
      <Card className="mb-6">
        <p className="text-sm text-[var(--rr-text-secondary)]">Available</p>
        <p className="text-3xl font-bold text-white">₹{mockUser.walletBalance}</p>
        <Button href="/redemption" className="mt-4" variant="outline">Redeem</Button>
      </Card>
      <h2 className="mb-3 text-sm font-semibold text-[var(--rr-text-secondary)]">Recent</h2>
      {mockTransactions.map((t) => (
        <Card key={t.id} className="mb-2 flex justify-between text-sm">
          <span className="text-white">{t.label}</span>
          <span className={t.amount > 0 ? "text-[var(--rr-success)]" : "text-white"}>
            {t.amount > 0 ? "+" : ""}{t.amount}
          </span>
        </Card>
      ))}
    </div>
  );
}
