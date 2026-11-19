"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { homeForRole, useAuth } from "@/lib/auth/AuthProvider";
import { cn } from "@/lib/utils";

/** Hamburger menu for the marketing nav on small screens. The dropdown anchors to the nav pill. */
export function MobileMenu({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const signedIn = Boolean(user && profile);

  // Close on navigation.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 -z-10 cursor-default bg-black/50 backdrop-blur-sm"
          />
          <nav
            id="mobile-menu"
            className="absolute inset-x-0 top-full mt-2 animate-fade-up rounded-3xl border border-white/10 bg-[var(--rr-surface)]/95 p-3 shadow-2xl shadow-black/50 backdrop-blur-xl"
          >
            <ul className="flex flex-col">
              {links.map((l) => {
                const active = pathname === l.href;
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className={cn(
                        "flex items-center justify-between rounded-2xl px-4 py-3 text-base font-medium transition",
                        active ? "bg-white/10 text-white" : "text-[var(--rr-text-secondary)] hover:bg-white/5 hover:text-white",
                      )}
                    >
                      {l.label}
                      <span aria-hidden className="text-[var(--rr-text-tertiary)]">
                        →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 grid gap-2 border-t border-white/10 pt-3">
              {signedIn ? (
                <Link
                  href={homeForRole(profile?.userType)}
                  className="rounded-full bg-[var(--color-primary)] px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Open dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-full border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-white/5"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/role-selection"
                    className="rounded-full bg-[var(--color-primary)] px-4 py-3 text-center text-sm font-semibold text-white"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </nav>
        </>
      ) : null}
    </div>
  );
}
