import { MarketingFooter, MarketingNav } from "@/components/layout/MarketingChrome";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "How it works" };

const steps = [
  { title: "Choose your event", body: "Wedding, birthday, engagement, corporate, or brand collab." },
  { title: "Pick a package", body: "Basic, Standard, or Premium Live with clear pricing." },
  { title: "Select a provider", body: "Browse portfolios, ratings, and catalogues in your city." },
  { title: "Pay & celebrate", body: "Secure checkout, live tracking, and reels delivered fast." },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <main className="px-4 pb-20 pt-28 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold text-white">How it works</h1>
          <p className="mt-3 text-[var(--rr-text-secondary)]">
            One clear path from idea to shareable reel.
          </p>
          <div className="mt-12 space-y-6">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="flex gap-5 rounded-2xl border border-[var(--rr-outline)]/50 bg-[var(--rr-surface)] p-6"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--rr-primary)] font-semibold">
                  {i + 1}
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-white">{s.title}</h2>
                  <p className="mt-1 text-sm text-[var(--rr-text-secondary)]">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Button href="/event-type-selection">Try booking flow</Button>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
