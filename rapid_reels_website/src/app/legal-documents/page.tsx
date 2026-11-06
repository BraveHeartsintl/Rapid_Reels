import { MarketingFooter, MarketingNav } from "@/components/layout/MarketingChrome";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <main className="mx-auto max-w-lg px-4 pb-20 pt-28">
        <h1 className="text-3xl font-bold text-white">Legal documents</h1>
        <ul className="mt-8 space-y-3 text-sm">
          <li><Link className="text-[var(--rr-secondary)]" href="/legal/terms">Terms</Link></li>
          <li><Link className="text-[var(--rr-secondary)]" href="/legal/privacy">Privacy</Link></li>
          <li><Link className="text-[var(--rr-secondary)]" href="/legal/refund">Refunds</Link></li>
        </ul>
      </main>
      <MarketingFooter />
    </div>
  );
}
