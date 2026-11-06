import { PageHeader } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";

export default function Page() {
  return (
    <div>
      <PageHeader title="Referral history" />
      {["Neha joined — ₹250", "Rahul pending", "Priya joined — ₹250"].map((r) => (
        <Card key={r} className="mb-2 text-sm text-white">{r}</Card>
      ))}
    </div>
  );
}
