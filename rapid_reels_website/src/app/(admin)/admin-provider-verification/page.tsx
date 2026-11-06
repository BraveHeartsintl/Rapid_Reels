import { Badge, Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockProviders } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Provider verification</h1>
        <Button variant="outline" className="px-3 py-2 text-xs">Static action</Button>
      </div>
      {mockProviders.map((p) => (
        <Card key={p.id} className="mb-2 flex items-center justify-between text-sm">
          <p className="text-white">{p.name}</p>
          <div className="flex gap-2">
            <Badge tone={p.verified ? "success" : "warning"}>
              {p.verified ? "verified" : "pending"}
            </Badge>
            <Button className="px-3 py-1 text-xs">Review</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
