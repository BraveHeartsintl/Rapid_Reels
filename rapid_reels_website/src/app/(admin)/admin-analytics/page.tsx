import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function Page() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Analytics</h1>
        <Button variant="outline" className="px-3 py-2 text-xs">Static action</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-[var(--rr-text-tertiary)]">DAU</p>
          <p className="text-2xl font-bold text-white">4,210</p>
        </Card>
        <Card>
          <p className="text-xs text-[var(--rr-text-tertiary)]">Bookings / wk</p>
          <p className="text-2xl font-bold text-white">186</p>
        </Card>
        <Card>
          <p className="text-xs text-[var(--rr-text-tertiary)]">Avg delivery</p>
          <p className="text-2xl font-bold text-white">22m</p>
        </Card>
      </div>
    </div>
  );
}
