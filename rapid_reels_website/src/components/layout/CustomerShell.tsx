"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/home", label: "Home", icon: "⌂" },
  { href: "/discover", label: "Discover", icon: "◎" },
  { href: "/my-events", label: "Events", icon: "▦" },
  { href: "/profile", label: "Profile", icon: "☺" },
];

export function CustomerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col bg-[var(--rr-bg)] md:max-w-none md:flex-row">
      <aside className="hidden w-56 shrink-0 border-r border-[var(--rr-outline)]/50 bg-[var(--rr-surface)] p-4 md:block">
        <Link href="/" className="mb-8 block text-sm font-semibold text-[var(--rr-secondary)]">
          Rapid Reels
        </Link>
        <nav className="flex flex-col gap-1">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "rounded-xl px-3 py-2.5 text-sm transition",
                pathname.startsWith(t.href)
                  ? "bg-[var(--rr-primary)]/25 text-white"
                  : "text-[var(--rr-text-secondary)] hover:bg-white/5",
              )}
            >
              {t.label}
            </Link>
          ))}
          <Link
            href="/event-type-selection"
            className="mt-4 rounded-xl bg-[var(--rr-primary)] px-3 py-2.5 text-center text-sm font-semibold text-white"
          >
            Book event
          </Link>
        </nav>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col pb-20 md:pb-0">
        <main className="flex-1 px-4 py-5 sm:px-6">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[var(--rr-outline)]/60 bg-[var(--rr-surface)]/95 backdrop-blur md:hidden">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px]",
                pathname.startsWith(t.href)
                  ? "text-[var(--rr-secondary)]"
                  : "text-[var(--rr-text-tertiary)]",
              )}
            >
              <span className="text-lg leading-none">{t.icon}</span>
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
