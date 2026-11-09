"use client";

import { useState } from "react";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { PageHeader } from "@/components/layout/FlowScreen";
import { Notice } from "@/components/ui/State";
import { useAuth } from "@/lib/auth/AuthProvider";
import { updateUserProfile } from "@/lib/data/queries";
import { errorMessage } from "@/lib/format";

const items = [
  ["/edit-profile", "Edit profile"],
  ["/payment-methods", "Payment methods"],
  ["/cookie-preferences", "Cookie preferences"],
  ["/legal/terms", "Terms & privacy"],
  ["/help-support", "Help & support"],
];

export default function Page() {
  const { user, profile, refreshProfile } = useAuth();
  const [override, setOverride] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const marketing = override ?? Boolean((profile?.metadata as { marketingConsent?: boolean } | undefined)?.marketingConsent);

  async function toggle(next: boolean) {
    if (!user) return;
    setOverride(next);
    setError(null);
    try {
      await updateUserProfile(user.uid, { "metadata.marketingConsent": next });
      await refreshProfile();
    } catch (e) {
      setOverride(!next);
      setError(errorMessage(e));
    }
  }

  return (
    <div>
      <PageHeader title="Settings" />
      <label className="mb-3 flex items-center justify-between rounded-2xl bg-[var(--rr-card)] px-4 py-3 text-sm text-white">
        Offers and updates
        <input type="checkbox" checked={marketing} onChange={(e) => toggle(e.target.checked)} className="h-4 w-4 accent-[var(--rr-primary)]" />
      </label>
      {error ? <div className="mb-3"><Notice>{error}</Notice></div> : null}
      <div className="space-y-2">
        {items.map(([href, label]) => (
          <Link key={href} href={href} className="flex justify-between rounded-2xl bg-[var(--rr-card)] px-4 py-3 text-sm text-white">
            {label}
            <span className="text-[var(--rr-text-tertiary)]">→</span>
          </Link>
        ))}
      </div>
      <SignOutButton className="mt-8 block w-full text-center" />
    </div>
  );
}
