import { MarketingFooter, MarketingNav } from "@/components/layout/MarketingChrome";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { packages } from "@/lib/theme/tokens";

export const metadata = { title: "Packages" };

export default function PackagesPage() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <main className="px-4 pb-20 pt-28 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold text-white">Packages</h1>
          <p className="mt-3 text-[var(--rr-text-secondary)]">
            Transparent tiers — customize after you pick a provider.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {packages.map((p) => (
              <Card key={p.id} className="flex flex-col">
                <p className="text-sm text-[var(--rr-secondary)]">{p.duration}</p>
                <h2 className="mt-2 text-xl font-semibold text-white">{p.name}</h2>
                <p className="mt-3 text-3xl font-bold text-white">{p.price}</p>
                <ul className="mt-6 flex-1 space-y-2 text-sm text-[var(--rr-text-secondary)]">
                  {p.features.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
                <Button href="/package-selection" className="mt-8 w-full">
                  Select
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
