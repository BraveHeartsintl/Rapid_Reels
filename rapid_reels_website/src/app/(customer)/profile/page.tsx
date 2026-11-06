import Link from "next/link";
import { PageHeader } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";
import { mockUser } from "@/lib/mock";

export const metadata = { title: "Profile" };

const links = [
  { href: "/edit-profile", label: "Edit profile" },
  { href: "/saved-venues", label: "Saved venues" },
  { href: "/wallet", label: "Wallet" },
  { href: "/referral-dashboard", label: "Referrals" },
  { href: "/my-transactions", label: "Transactions" },
  { href: "/reels", label: "My reels" },
  { href: "/settings", label: "Settings" },
  { href: "/help-support", label: "Help & support" },
  { href: "/legal/terms", label: "Legal" },
];

export default function ProfilePage() {
  return (
    <div>
      <PageHeader title={mockUser.name} subtitle={`${mockUser.email} · ${mockUser.city}`} />
      <Card className="mb-6">
        <p className="text-sm text-[var(--rr-text-secondary)]">Referral code</p>
        <p className="text-xl font-semibold text-[var(--rr-secondary)]">{mockUser.referralCode}</p>
      </Card>
      <div className="space-y-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-center justify-between rounded-2xl border border-[var(--rr-outline)]/40 bg-[var(--rr-card)] px-4 py-3 text-sm text-white"
          >
            {l.label}
            <span className="text-[var(--rr-text-tertiary)]">→</span>
          </Link>
        ))}
      </div>
      <Link href="/" className="mt-8 block text-center text-sm text-[var(--rr-error)]">
        Sign out (back to marketing)
      </Link>
    </div>
  );
}
