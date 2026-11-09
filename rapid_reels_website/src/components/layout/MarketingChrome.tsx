import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const links = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/packages", label: "Packages" },
  { href: "/for-customers", label: "Customers" },
  { href: "/for-providers", label: "Providers" },
  { href: "/download", label: "Download" },
];

export function MarketingNav() {
  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Rapid Reels"
            width={140}
            height={78}
            className="h-11 w-auto object-contain"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-[var(--rr-text-secondary)] transition hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button href="/login" variant="ghost" className="hidden sm:inline-flex px-4 py-2">
            Sign in
          </Button>
          <Button href="/role-selection" className="px-4 py-2 text-xs sm:text-sm">
            Get started
          </Button>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--rr-outline)]/50 bg-[var(--rr-surface)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="mb-3 flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Rapid Reels"
              width={120}
              height={67}
              className="h-9 w-auto object-contain"
            />
          </div>
          <p className="max-w-sm text-sm text-[var(--rr-text-secondary)]">
            Book verified event videographers. Get social-ready reels in minutes — not months.
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-white">Product</p>
          <ul className="space-y-2 text-sm text-[var(--rr-text-secondary)]">
            <li>
              <Link href="/how-it-works" className="hover:text-white">
                How it works
              </Link>
            </li>
            <li>
              <Link href="/packages" className="hover:text-white">
                Packages
              </Link>
            </li>
            <li>
              <Link href="/download" className="hover:text-white">
                Download app
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-white">Legal</p>
          <ul className="space-y-2 text-sm text-[var(--rr-text-secondary)]">
            <li>
              <Link href="/legal/terms" className="hover:text-white">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/legal/privacy" className="hover:text-white">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/legal/refund" className="hover:text-white">
                Refunds
              </Link>
            </li>
            <li>
              <Link href="/cookie-preferences" className="hover:text-white">
                Cookies
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--rr-outline)]/40 py-4 text-center text-xs text-[var(--rr-text-tertiary)]">
        © 2026 Rapid Reels. All rights reserved.
      </div>
    </footer>
  );
}
