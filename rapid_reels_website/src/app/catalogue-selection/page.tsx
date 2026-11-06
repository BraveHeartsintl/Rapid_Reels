import { FlowScreen } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

const items = [
  { name: "Wedding highlight day", price: "₹19,999" },
  { name: "Ceremony only", price: "₹9,999" },
  { name: "Reception social pack", price: "₹7,499" },
];

function Inner() {
  return (
    <div className="space-y-3">
      {items.map((i) => (
        <Link key={i.name} href="/provider-package-pick" className="block">
          <Card className="flex justify-between">
            <span className="text-white">{i.name}</span>
            <span className="text-[var(--rr-secondary)]">{i.price}</span>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <FlowScreen
      title="Catalogue"
      subtitle="Pick a bookable offering"
      backHref="/provider-portfolio"
      nextHref="/provider-package-pick"
      nextLabel="Continue"
    >
      <Inner />
    </FlowScreen>
  );
}
