import Image from "next/image";
import { MarketingFooter, MarketingNav } from "@/components/layout/MarketingChrome";
import { Button } from "@/components/ui/Button";
import { EVENT_TYPES as eventTypes } from "@/lib/format";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <section className="hero-glow relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pb-24">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -right-20 top-24 h-[70%] w-[55%] rounded-full bg-[var(--rr-primary)]/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-1/2 w-full bg-gradient-to-t from-[var(--rr-bg)] to-transparent" />
        </div>
        <div className="relative mx-auto w-full max-w-6xl animate-fade-up">
          <Image
            src="/logo.png"
            alt="Rapid Reels"
            width={320}
            height={179}
            priority
            className="mb-6 h-auto w-56 object-contain sm:w-72"
          />
          <h1 className="sr-only">Rapid Reels</h1>
          <p className="mt-4 max-w-xl text-lg text-[var(--rr-text-secondary)] sm:text-xl">
            Event reels in minutes — book verified creators and share while the moment is still live.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/role-selection">Get started</Button>
            <Button href="/how-it-works" variant="outline">
              See how it works
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--rr-outline)]/40 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Built for every celebration</h2>
          <p className="mt-2 max-w-2xl text-[var(--rr-text-secondary)]">
            Discover providers by event type, compare packages, and get delivery timed for social sharing.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {eventTypes.map((e, i) => (
              <div
                key={e.id}
                className="animate-fade-in rounded-2xl border border-[var(--rr-outline)]/50 bg-[var(--rr-surface)] p-5"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div
                  className="mb-3 h-1.5 w-10 rounded-full"
                  style={{ background: e.color }}
                />
                <p className="font-medium text-white">{e.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--rr-surface)] px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">From booking to first reel</h2>
            <p className="mt-3 text-[var(--rr-text-secondary)]">
              Pick an event, choose a package, lock a verified provider, pay securely, and track live coverage —
              then download and share your reels.
            </p>
            <div className="mt-6">
              <Button href="/how-it-works">Explore the flow</Button>
            </div>
          </div>
          <ol className="space-y-4">
            {[
              "Select event type & package",
              "Match with a verified provider",
              "Pay and track your event live",
              "Receive & share reels fast",
            ].map((step, i) => (
              <li key={step} className="flex gap-4 text-[var(--rr-text-secondary)]">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--rr-primary)] text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <span className="pt-1 text-white">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-4 py-20 text-center sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Get started on the web</h2>
          <p className="mt-3 text-[var(--rr-text-secondary)]">
            Book an event as a customer, manage your studio as a provider, or run the platform as an admin. Sign in with your phone number.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/login">Customer sign in</Button>
            <Button href="/provider/login" variant="outline">
              Provider sign in
            </Button>
            <Button href="/admin/login" variant="secondary">
              Admin sign in
            </Button>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
