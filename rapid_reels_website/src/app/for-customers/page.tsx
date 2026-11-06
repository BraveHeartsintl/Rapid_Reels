import { MarketingFooter, MarketingNav } from "@/components/layout/MarketingChrome";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "For customers" };

export default function ForCustomersPage() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <main className="hero-glow px-4 pb-20 pt-28 sm:px-6">
        <div className="mx-auto max-w-3xl animate-fade-up">
          <h1 className="text-4xl font-bold text-white">For customers</h1>
          <p className="mt-4 text-lg text-[var(--rr-text-secondary)]">
            Discover creators, book packages, pay in-app, and get reels ready for Instagram and WhatsApp while the event is still buzzing.
          </p>
          <ul className="mt-10 space-y-4 text-[var(--rr-text-secondary)]">
            <li>• Transparent packages and verified reviews</li>
            <li>• Live event tracking and same-day highlight reels</li>
            <li>• Wallet rewards and referrals</li>
            <li>• Discover feed of public event reels</li>
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/login">Start customer flow</Button>
            <Button href="/packages" variant="outline">
              View packages
            </Button>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
