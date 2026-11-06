import { MarketingFooter, MarketingNav } from "@/components/layout/MarketingChrome";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Privacy policy" };

export default function Page() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6">
        <h1 className="text-3xl font-bold text-white">Privacy policy</h1>
        <p className="mt-6 text-[var(--rr-text-secondary)] leading-relaxed">This static site does not collect personal data or connect to Firebase. The production Rapid Reels app processes account, booking, and media data under its published privacy policy.</p>
        <Button href="/" className="mt-10" variant="outline">Back home</Button>
      </main>
      <MarketingFooter />
    </div>
  );
}
