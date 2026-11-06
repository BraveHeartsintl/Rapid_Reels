import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function Page() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Reviews moderation</h1>
        <Button variant="outline" className="px-3 py-2 text-xs">Static action</Button>
      </div>
      <Card className="text-sm text-white">★ 4.8 — “Amazing same-day reels” — awaiting approval</Card>
    </div>
  );
}
