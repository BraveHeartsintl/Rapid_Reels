"use client";

import { useState } from "react";
import { MarketingFooter, MarketingNav } from "@/components/layout/MarketingChrome";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { SUPPORT_WHATSAPP_DISPLAY, SUPPORT_WHATSAPP_URL } from "@/lib/supportContact";

const SUPPORT_EMAIL = "support@rapidreels.com";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="min-h-screen">
      <MarketingNav />
      <main className="px-4 pb-20 pt-28 sm:px-6">
        <div className="mx-auto max-w-lg">
          <h1 className="text-4xl font-bold text-white">Contact</h1>
          <p className="mt-3 text-[var(--rr-text-secondary)]">
            Message us on WhatsApp, or send an email and your mail app will open with it ready to go. Signed-in customers can also raise a ticket from{" "}
            <a href="/help-support" className="text-[var(--rr-secondary)] underline">Help &amp; support</a>.
          </p>
          <a
            href={SUPPORT_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex w-full items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            WhatsApp {SUPPORT_WHATSAPP_DISPLAY}
          </a>
          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const subject = encodeURIComponent(`Rapid Reels enquiry from ${name || "website visitor"}`);
              const body = encodeURIComponent(`${message}\n\n— ${name}${email ? ` (${email})` : ""}`);
              window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
            }}
          >
            <Input label="Name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Textarea label="Message" placeholder="How can we help?" value={message} onChange={(e) => setMessage(e.target.value)} required />
            <Button type="submit" className="w-full">Send message</Button>
          </form>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
