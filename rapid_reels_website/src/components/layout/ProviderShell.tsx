"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/provider-portal/demo/home", label: "Home" },
  { href: "/provider-portal/demo/schedule", label: "Schedule" },
  { href: "/provider-portal/demo/bookings", label: "Bookings" },
  { href: "/provider-portal/demo/earnings", label: "Earnings" },
  { href: "/provider-portal/demo/account", label: "Account" },
];

export function ProviderShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--rr-bg)]">
      <header className="border-b border-[var(--rr-outline)]/50 bg-[var(--rr-surface)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/provider-portal/demo/home" className="font-semibold text-white">
            Provider Portal
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-[var(--rr-text-tertiary)] hover:text-white">
              Marketing site
            </Link>
            <SignOutButton className="text-xs" />
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 pb-2">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "shrink-0 rounded-xl px-4 py-2 text-sm",
                pathname === t.href
                  ? "bg-[var(--rr-primary)] text-white"
                  : "text-[var(--rr-text-secondary)] hover:bg-white/5",
              )}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
