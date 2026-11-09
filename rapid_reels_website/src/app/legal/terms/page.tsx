import { MarketingFooter, MarketingNav } from "@/components/layout/MarketingChrome";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Terms of service" };

export default function Page() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6">
        <h1 className="text-3xl font-bold text-white">Terms of service</h1>
        <p className="mt-6 text-[var(--rr-text-secondary)] leading-relaxed">This is a short summary of the terms for using the Rapid Reels website. The full contractual terms are the same as those shown in the Rapid Reels mobile app. By booking or listing services on Rapid Reels you agree to them.</p>
        <Button href="/" className="mt-10" variant="outline">Back home</Button>
      </main>
      <MarketingFooter />
    </div>
  );
}
