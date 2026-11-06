import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockEarnings } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Provider earnings</h1>
        <Button variant="outline" className="px-3 py-2 text-xs">Static action</Button>
      </div>
      {mockEarnings.map((e) => (
        <Card key={e.month} className="mb-2 flex justify-between text-sm">
          <p className="text-white">{e.month}</p>
          <p className="text-white">₹{e.amount.toLocaleString()}</p>
        </Card>
      ))}
    </div>
  );
}
