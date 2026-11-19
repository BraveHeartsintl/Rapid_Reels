"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { cn } from "@/lib/utils";

export type NavLink = { href: string; label: string; icon?: string };
export type NavGroup = { label: string; items: NavLink[] };

export function linkActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`) || pathname.startsWith(`${href}?`);
}

export const customerGroups: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { href: "/home", label: "Home", icon: "⌂" },
      { href: "/discover", label: "Discover", icon: "◎" },
      { href: "/my-events", label: "Events", icon: "▦" },
      { href: "/reels", label: "Reels", icon: "▶" },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/wallet", label: "Wallet" },
      { href: "/profile", label: "Profile", icon: "☺" },
      { href: "/settings", label: "Settings" },
    ],
  },
];

export const customerMobile: NavLink[] = [
  { href: "/home", label: "Home", icon: "⌂" },
  { href: "/discover", label: "Discover", icon: "◎" },
  { href: "/my-events", label: "Events", icon: "▦" },
  { href: "/profile", label: "Profile", icon: "☺" },
];

export const providerGroups: NavGroup[] = [
  {
    label: "Studio",
    items: [
      { href: "/provider-dashboard", label: "Home", icon: "⌂" },
      { href: "/provider-bookings", label: "Bookings", icon: "▦" },
      { href: "/provider-booking-calendar", label: "Calendar", icon: "▣" },
      { href: "/provider-catalogue", label: "Catalogue", icon: "☰" },
    ],
  },
  {
    label: "Business",
    items: [
      { href: "/provider-earnings", label: "Earnings", icon: "£" },
      { href: "/provider-business-profile", label: "Account", icon: "☺" },
    ],
  },
];

export const providerMobile: NavLink[] = [
  { href: "/provider-dashboard", label: "Home", icon: "⌂" },
  { href: "/provider-bookings", label: "Bookings", icon: "▦" },
  { href: "/provider-booking-calendar", label: "Calendar", icon: "▣" },
  { href: "/provider-earnings", label: "Earnings", icon: "£" },
  { href: "/provider-business-profile", label: "Account", icon: "☺" },
];

export const adminGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin-dashboard", label: "Dashboard" },
      { href: "/admin-analytics", label: "Analytics" },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin-user-management", label: "Users" },
      { href: "/admin-provider-verification", label: "Verification" },
      { href: "/admin-booking-management", label: "Bookings" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin-content-moderation", label: "Moderation" },
      { href: "/admin-reel-approval", label: "Reel approval" },
      { href: "/admin-reviews-moderation", label: "Reviews" },
      { href: "/admin-content-reports", label: "Reports" },
    ],
  },
  {
    label: "Money",
    items: [
      { href: "/admin-offers-management", label: "Offers" },
      { href: "/admin-payment-management", label: "Payments" },
      { href: "/admin-provider-earnings", label: "Earnings" },
    ],
  },
];

export function DashboardShell({
  brand,
  groups,
  mobile = "tabs",
  mobileTabs,
  action,
  backHref,
  children,
}: {
  brand: string;
  groups: NavGroup[];
  mobile?: "tabs" | "scroll";
  mobileTabs?: NavLink[];
  action?: React.ReactNode;
  /** Explicit back target; otherwise browser history is used on non-root pages. */
  backHref?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const flat = groups.flatMap((g) => g.items);

  // Signed-in users must land on their own app, not the marketing site (which asks them to sign in again).
  const homeHref = brand === "Provider" ? "/provider-dashboard" : brand === "Admin" ? "/admin-dashboard" : "/home";
  const isRoot = flat.some((i) => i.href === pathname) || pathname === homeHref;
  const showBack = Boolean(backHref) || !isRoot;

  function goBack() {
    if (backHref) return router.push(backHref);
    if (typeof window !== "undefined" && window.history.length > 1) return router.back();
    router.push(homeHref);
  }

  return (
    <div className="flex min-h-screen bg-[var(--rr-bg)]">
      <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-[var(--rr-outline)]/50 bg-[var(--rr-surface)] md:flex">
        <Link
          href={homeHref}
          className="mx-3 mt-4 mb-4 flex flex-col items-center gap-1 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4 transition hover:bg-white/[0.06]"
        >
          <Image
            src="/logo.png"
            alt="Rapid Reels"
            width={180}
            height={100}
            priority
            className="h-16 w-auto object-contain drop-shadow-[0_0_20px_rgba(254,0,42,0.35)]"
          />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--rr-text-tertiary)]">
            {brand}
          </span>
        </Link>
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--rr-text-tertiary)]">
                {group.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const on = linkActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "rounded-lg px-3 py-2.5 text-sm font-medium transition duration-200",
                        on
                          ? "bg-[var(--color-primary)] text-white"
                          : "text-[var(--rr-text-secondary)] hover:bg-white/5 hover:text-white",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-[var(--rr-outline)]/50 p-4">
          {action ? <div className="mb-3">{action}</div> : null}
          <SignOutButton className="px-3" />
        </div>
      </aside>

      <div className={cn("flex min-w-0 flex-1 flex-col", mobile === "tabs" && "pb-20 md:pb-0")}>
        <header className="sticky top-0 z-30 border-b border-[var(--rr-outline)]/40 bg-[var(--rr-bg)]/90 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-8">
            <div className="flex min-w-0 items-center gap-3">
              {showBack ? (
                <button
                  type="button"
                  onClick={goBack}
                  aria-label="Go back"
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-[var(--rr-text-secondary)] transition hover:bg-white/10 hover:text-white"
                >
                  <span aria-hidden>←</span> Back
                </button>
              ) : null}
              <Link href={homeHref} className="md:hidden">
                <Image src="/logo.png" alt="Rapid Reels" width={96} height={54} className="h-7 w-auto object-contain" />
              </Link>
              <p className="hidden truncate text-sm font-semibold text-white sm:block">{brand}</p>
            </div>
            <SignOutButton className="shrink-0 text-xs" />
          </div>
          {mobile === "scroll" ? (
            <div className="flex gap-2 overflow-x-auto px-4 pb-3 md:hidden">
              {flat.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
                    linkActive(pathname, item.href)
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--rr-card)] text-[var(--rr-text-secondary)]",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}
        </header>

        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>

        {mobile === "tabs" && mobileTabs ? (
          <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[var(--rr-outline)]/60 bg-[var(--rr-surface)]/95 backdrop-blur md:hidden">
            {mobileTabs.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px]",
                  linkActive(pathname, item.href) ? "text-[var(--rr-secondary)]" : "text-[var(--rr-text-tertiary)]",
                )}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
    </div>
  );
}
