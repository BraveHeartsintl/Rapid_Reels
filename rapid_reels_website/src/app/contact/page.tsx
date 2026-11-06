"use client";

import { MarketingFooter, MarketingNav } from "@/components/layout/MarketingChrome";
import { DemoToastButton } from "@/components/ui/DemoToast";
import { Input } from "@/components/ui/Input";

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <main className="px-4 pb-20 pt-28 sm:px-6">
        <div className="mx-auto max-w-lg">
          <h1 className="text-4xl font-bold text-white">Contact</h1>
          <p className="mt-3 text-[var(--rr-text-secondary)]">
            Static form — submissions show a demo toast only.
          </p>
          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <Input label="Name" placeholder="Your name" />
            <Input label="Email" type="email" placeholder="you@example.com" />
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-[var(--rr-text-secondary)]">Message</span>
              <textarea
                className="min-h-32 w-full rounded-2xl border border-[var(--rr-outline)] bg-[var(--rr-surface)] px-4 py-3 text-white outline-none focus:border-[var(--rr-primary)]"
                placeholder="How can we help?"
              />
            </label>
            <DemoToastButton label="Send message" />
          </form>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
