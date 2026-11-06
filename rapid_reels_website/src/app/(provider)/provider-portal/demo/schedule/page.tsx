import { Card } from "@/components/ui/Card";
import { mockBookings } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-white">Schedule</h1>
      <div className="mb-4 grid grid-cols-7 gap-2 text-center text-xs text-[var(--rr-text-tertiary)]">
        {["M","T","W","T","F","S","S"].map((d,i) => <div key={i}>{d}</div>)}
        {Array.from({length: 28}, (_,i) => (
          <div key={i} className={"rounded-lg py-3 " + (i === 16 ? "bg-[var(--rr-primary)] text-white" : "bg-[var(--rr-card)]")}>{i+1}</div>
        ))}
      </div>
      {mockBookings.filter(b => b.status !== "cancelled").map((b) => (
        <Card key={b.id} className="mb-3">
          <p className="text-white">{b.title}</p>
          <p className="text-xs text-[var(--rr-text-tertiary)]">{b.date} · {b.venue}</p>
        </Card>
      ))}
    </div>
  );
}
