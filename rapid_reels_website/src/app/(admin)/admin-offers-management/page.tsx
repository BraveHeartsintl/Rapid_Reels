import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockOffers } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Offers</h1>
        <Button variant="outline" className="px-3 py-2 text-xs">Static action</Button>
      </div>
      {mockOffers.map((o) => (
        <Card key={o.id} className="mb-2 text-sm">
          <p className="text-white">{o.title}</p>
          <p className="text-[var(--rr-secondary)]">{o.code}</p>
        </Card>
      ))}
    </div>
  );
}
