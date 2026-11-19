import Image from "next/image";
import Link from "next/link";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { NavAuthActions } from "@/components/layout/NavAuthActions";

const links = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/packages", label: "Packages" },
  { href: "/for-customers", label: "Customers" },
  { href: "/for-providers", label: "Providers" },
  { href: "/download", label: "Download" },
];

export function MarketingNav() {
  return (
    <header className="absolute inset-x-0 top-0 z-40 px-3 pt-4 sm:px-6">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border border-white/10 bg-white/5 px-4 py-2 shadow-lg shadow-black/20 backdrop-blur-xl sm:px-5">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Rapid Reels"
            width={140}
            height={78}
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-[var(--rr-text-secondary)] lg:px-4 transition hover:bg-white/10 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <NavAuthActions />
          <MobileMenu links={links} />
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--rr-outline)]/50 bg-[var(--color-ink)]">
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
              <Link href="/for-customers" className="hover:text-white">
                For customers
              </Link>
            </li>
            <li>
              <Link href="/for-providers" className="hover:text-white">
                For providers
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
