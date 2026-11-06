import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockReels } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Content reports</h1>
        <Button variant="outline" className="px-3 py-2 text-xs">Static action</Button>
      </div>
      {mockReels.map((r) => (
        <Card key={r.id} className="mb-2 flex justify-between text-sm">
          <p className="text-white">Report: {r.title}</p>
          <Button className="px-3 py-1 text-xs" variant="outline">Review</Button>
        </Card>
      ))}
    </div>
  );
}
