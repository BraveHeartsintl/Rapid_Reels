import { MarketingFooter, MarketingNav } from "@/components/layout/MarketingChrome";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "For providers" };

export default function ForProvidersPage() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <main className="hero-glow px-4 pb-20 pt-28 sm:px-6">
        <div className="mx-auto max-w-3xl animate-fade-up">
          <h1 className="text-4xl font-bold text-white">For providers</h1>
          <p className="mt-4 text-lg text-[var(--rr-text-secondary)]">
            Run your videography business on Rapid Reels — catalogue, calendar, live event mode, reel delivery, and earnings in one portal.
          </p>
          <ul className="mt-10 space-y-4 text-[var(--rr-text-secondary)]">
            <li>• Verified profile and service areas</li>
            <li>• Accept bookings and manage timelines</li>
            <li>• Live mode with fast reel turnaround</li>
            <li>• Track payouts and catalogue offerings</li>
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/provider/registration">Join as provider</Button>
            <Button href="/provider/login" variant="outline">
              Provider login
            </Button>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
