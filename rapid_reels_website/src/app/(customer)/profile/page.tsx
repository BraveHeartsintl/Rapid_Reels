"use client";

import Link from "next/link";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { PageHeader } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth/AuthProvider";

const links = [
  { href: "/edit-profile", label: "Edit profile" },
  { href: "/saved-venues", label: "Saved venues" },
  { href: "/wallet", label: "Wallet" },
  { href: "/referral-dashboard", label: "Referrals" },
  { href: "/my-transactions", label: "Transactions" },
  { href: "/reels", label: "My reels" },
  { href: "/my-tickets", label: "My tickets" },
  { href: "/settings", label: "Settings" },
  { href: "/help-support", label: "Help & support" },
  { href: "/legal/terms", label: "Legal" },
];

export default function ProfilePage() {
  const { profile, user } = useAuth();
  const city = profile?.currentLocation?.city;
  return (
    <div>
      <PageHeader
        title={profile?.fullName || "Your profile"}
        subtitle={[profile?.email, profile?.phoneNumber || user?.phoneNumber, city && city !== "Unknown" ? city : null]
          .filter(Boolean)
          .join(" · ")}
      />
      <Card className="mb-6">
        <p className="text-sm text-[var(--rr-text-secondary)]">Referral code</p>
        <p className="text-xl font-semibold text-[var(--rr-secondary)]">{profile?.referralCode ?? "—"}</p>
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
      <SignOutButton className="mt-8 block w-full text-center" />
    </div>
  );
}
