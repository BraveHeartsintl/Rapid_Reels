"use client";

import Link from "next/link";
import { SignOutButton } from "@/components/auth/SignOutButton";

const links = [
  ["/provider-dashboard", "Dashboard"],
  ["/provider-business-profile", "Business profile & packages"],
  ["/provider-portfolio-upload", "Deliver a reel"],
  ["/provider-service-areas", "Service areas"],
  ["/provider-availability-calendar", "Availability"],
  ["/provider-catalogue", "Catalogue"],
  ["/provider-verification", "Verification"],
  ["/provider-document-upload", "Documents"],
  ["/provider-bank-details", "Bank details"],
  ["/provider-my-reels", "My reels"],
];

export default function Page() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-white">Account</h1>
      <div className="space-y-2">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className="flex justify-between rounded-2xl bg-[var(--rr-card)] px-4 py-3 text-sm text-white">
            {label}<span>→</span>
          </Link>
        ))}
      </div>
      <SignOutButton className="mt-6" />
    </div>
  );
}
