"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin-dashboard", label: "Dashboard" },
  { href: "/admin-user-management", label: "Users" },
  { href: "/admin-booking-management", label: "Bookings" },
  { href: "/admin-provider-verification", label: "Verification" },
  { href: "/admin-content-moderation", label: "Moderation" },
  { href: "/admin-reel-approval", label: "Reel approval" },
  { href: "/admin-reviews-moderation", label: "Reviews" },
  { href: "/admin-content-reports", label: "Reports" },
  { href: "/admin-offers-management", label: "Offers" },
  { href: "/admin-payment-management", label: "Payments" },
  { href: "/admin-provider-earnings", label: "Earnings" },
  { href: "/admin-analytics", label: "Analytics" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[var(--rr-bg)]">
      <aside className="hidden w-60 shrink-0 border-r border-[var(--rr-outline)]/50 bg-[var(--rr-surface)] p-4 lg:block">
        <p className="mb-6 text-sm font-semibold text-[var(--rr-secondary)]">Admin Console</p>
        <nav className="flex flex-col gap-0.5">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm",
                pathname === l.href
                  ? "bg-[var(--rr-primary)]/30 text-white"
                  : "text-[var(--rr-text-secondary)] hover:bg-white/5",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <SignOutButton className="mt-6 px-3 text-left" />
      </aside>
      <div className="flex-1">
        <header className="border-b border-[var(--rr-outline)]/40 px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Admin</p>
            <SignOutButton className="text-xs" />
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="shrink-0 rounded-lg bg-[var(--rr-card)] px-3 py-1.5 text-xs text-[var(--rr-text-secondary)]"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
