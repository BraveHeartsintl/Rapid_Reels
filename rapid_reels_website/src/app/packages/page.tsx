import { MarketingFooter, MarketingNav } from "@/components/layout/MarketingChrome";
import { PackagesGrid } from "@/components/provider/PackagesGrid";

export const metadata = { title: "Packages" };

export default function PackagesPage() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <main className="px-4 pb-20 pt-28 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold text-white">Packages</h1>
          <p className="mt-3 text-[var(--rr-text-secondary)]">
            Transparent tiers from verified providers — customize after you pick one.
          </p>
          <PackagesGrid />
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
