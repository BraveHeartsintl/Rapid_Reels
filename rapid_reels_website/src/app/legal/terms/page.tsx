import { MarketingFooter, MarketingNav } from "@/components/layout/MarketingChrome";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Terms of service" };

export default function Page() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6">
        <h1 className="text-3xl font-bold text-white">Terms of service</h1>
        <p className="mt-6 text-[var(--rr-text-secondary)] leading-relaxed">This is a short static summary for the Rapid Reels marketing/demo website. Full contractual terms ship with the mobile app. By using this demo you acknowledge it is non-production and uses mock data only.</p>
        <Button href="/" className="mt-10" variant="outline">Back home</Button>
      </main>
      <MarketingFooter />
    </div>
  );
}
