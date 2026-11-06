import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockBookings } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Payments</h1>
        <Button variant="outline" className="px-3 py-2 text-xs">Static action</Button>
      </div>
      {mockBookings.map((b) => (
        <Card key={b.id} className="mb-2 flex justify-between text-sm">
          <p className="text-white">{b.title}</p>
          <p className="text-[var(--rr-success)]">{b.amount}</p>
        </Card>
      ))}
    </div>
  );
}
