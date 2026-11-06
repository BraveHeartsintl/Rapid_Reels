import { Card } from "@/components/ui/Card";
import { mockAdminStats } from "@/lib/mock";
import Link from "next/link";

const tiles: Array<{ label: string; value: string | number; href: string }> = [
  { label: "Users", value: mockAdminStats.users, href: "/admin-user-management" },
  { label: "Providers", value: mockAdminStats.providers, href: "/admin-provider-verification" },
  { label: "Bookings", value: mockAdminStats.bookings, href: "/admin-booking-management" },
  { label: "Reels", value: mockAdminStats.reels, href: "/admin-reel-approval" },
  { label: "Revenue", value: mockAdminStats.revenue, href: "/admin-payment-management" },
  {
    label: "Pending verify",
    value: mockAdminStats.pendingVerifications,
    href: "/admin-provider-verification",
  },
  { label: "Flagged", value: mockAdminStats.flaggedContent, href: "/admin-content-reports" },
];

export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Admin dashboard</h1>
      <p className="mt-1 text-sm text-[var(--rr-text-secondary)]">Platform overview (mock)</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Link key={tile.label} href={tile.href}>
            <Card>
              <p className="text-xs text-[var(--rr-text-tertiary)]">{tile.label}</p>
              <p className="mt-2 text-2xl font-bold text-white">{tile.value}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
