import { MarketingFooter, MarketingNav } from "@/components/layout/MarketingChrome";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Download" };

export default function DownloadPage() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <main className="hero-glow flex min-h-[70vh] items-center px-4 pb-20 pt-28 sm:px-6">
        <div className="mx-auto max-w-2xl text-center animate-fade-up">
          <h1 className="text-4xl font-bold text-white">Get the app</h1>
          <p className="mt-4 text-[var(--rr-text-secondary)]">
            Rapid Reels ships on iOS and Android. Store links are placeholders in this static demo.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button href="#" variant="primary">
              App Store (soon)
            </Button>
            <Button href="#" variant="outline">
              Google Play (soon)
            </Button>
          </div>
          <p className="mt-8 text-sm text-[var(--rr-text-tertiary)]">
            Or explore the{" "}
            <a href="/home" className="text-[var(--rr-secondary)] underline">
              web customer demo
            </a>
            .
          </p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
