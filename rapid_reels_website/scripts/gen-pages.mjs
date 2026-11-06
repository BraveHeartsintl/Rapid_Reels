import fs from "fs";
import path from "path";

const root = path.resolve("src/app");

function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  console.log("wrote", rel);
}

function flowPage({ slug, title, subtitle, next, nextLabel = "Continue", back = "/home", body }) {
  write(
    `${slug}/page.tsx`,
    `import { FlowScreen } from "@/components/layout/FlowScreen";
${body}

export default function Page() {
  return (
    <FlowScreen
      title="${title}"
      subtitle="${subtitle}"
      backHref="${back}"
      nextHref="${next}"
      nextLabel="${nextLabel}"
    >
      <Inner />
    </FlowScreen>
  );
}
`,
  );
}

flowPage({
  slug: "event-type-selection",
  title: "Select event type",
  subtitle: "What are you celebrating?",
  next: "/package-selection",
  body: `import { eventTypes } from "@/lib/mock";
import Link from "next/link";

function Inner() {
  return (
    <div className="grid gap-3">
      {eventTypes.map((e) => (
        <Link
          key={e.id}
          href="/package-selection"
          className="flex items-center gap-3 rounded-2xl border border-[var(--rr-outline)]/50 bg-[var(--rr-card)] p-4"
        >
          <span className="h-3 w-3 rounded-full" style={{ background: e.color }} />
          <span className="font-medium text-white">{e.label}</span>
        </Link>
      ))}
    </div>
  );
}`,
});

flowPage({
  slug: "package-selection",
  title: "Choose package",
  subtitle: "Transparent pricing for your event",
  next: "/event-details-form",
  back: "/event-type-selection",
  body: `import { packages } from "@/lib/theme/tokens";
import Link from "next/link";

function Inner() {
  return (
    <div className="space-y-3">
      {packages.map((p) => (
        <Link
          key={p.id}
          href="/event-details-form"
          className="block rounded-2xl border border-[var(--rr-outline)]/50 bg-[var(--rr-card)] p-4"
        >
          <div className="flex justify-between">
            <span className="font-medium text-white">{p.name}</span>
            <span className="text-[var(--rr-secondary)]">{p.price}</span>
          </div>
          <p className="mt-1 text-xs text-[var(--rr-text-tertiary)]">{p.duration}</p>
        </Link>
      ))}
    </div>
  );
}`,
});

flowPage({
  slug: "event-details-form",
  title: "Event details",
  subtitle: "Tell us about the day",
  next: "/venue-selection",
  back: "/package-selection",
  body: `import { Input } from "@/components/ui/Input";

function Inner() {
  return (
    <div className="space-y-4">
      <Input label="Event title" defaultValue="Priya & Arjun Wedding" />
      <Input label="Date" type="date" defaultValue="2026-11-18" />
      <Input label="Guest count" type="number" defaultValue="180" />
      <Input label="Notes" placeholder="Key moments to capture" />
    </div>
  );
}`,
});

flowPage({
  slug: "venue-selection",
  title: "Select venue",
  subtitle: "Saved addresses and map pin (static)",
  next: "/provider-selection",
  back: "/event-details-form",
  body: `import { mockVenues } from "@/lib/mock";
import Link from "next/link";

function Inner() {
  return (
    <div className="space-y-3">
      <div className="flex h-40 items-center justify-center rounded-2xl bg-[var(--rr-surface-elevated)] text-sm text-[var(--rr-text-tertiary)]">
        Map placeholder
      </div>
      {mockVenues.map((v) => (
        <Link
          key={v}
          href="/provider-selection"
          className="block rounded-2xl border border-[var(--rr-outline)]/50 bg-[var(--rr-card)] p-4 text-sm text-white"
        >
          {v}
        </Link>
      ))}
    </div>
  );
}`,
});

flowPage({
  slug: "provider-selection",
  title: "Choose provider",
  subtitle: "Verified creators in your city",
  next: "/provider-details",
  back: "/venue-selection",
  body: `import { mockProviders } from "@/lib/mock";
import Link from "next/link";
import { Badge } from "@/components/ui/Card";

function Inner() {
  return (
    <div className="space-y-3">
      {mockProviders.map((p) => (
        <Link
          key={p.id}
          href={"/provider-details?id=" + p.id}
          className="block rounded-2xl border border-[var(--rr-outline)]/50 bg-[var(--rr-card)] p-4"
        >
          <div className="flex justify-between gap-2">
            <div>
              <p className="font-medium text-white">{p.name}</p>
              <p className="text-xs text-[var(--rr-text-tertiary)]">
                ★ {p.rating} · from {p.priceFrom}
              </p>
            </div>
            {p.verified ? <Badge tone="success">Verified</Badge> : null}
          </div>
        </Link>
      ))}
    </div>
  );
}`,
});

flowPage({
  slug: "provider-details",
  title: "Provider details",
  subtitle: "Portfolio, reviews, and offerings",
  next: "/provider-portfolio",
  back: "/provider-selection",
  body: `import { mockProviders } from "@/lib/mock";
import { Badge, Card } from "@/components/ui/Card";

const p = mockProviders[0];

function Inner() {
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex justify-between">
          <h2 className="text-lg font-semibold text-white">{p.name}</h2>
          {p.verified ? <Badge tone="success">Verified</Badge> : null}
        </div>
        <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">
          ★ {p.rating} ({p.reviews} reviews) · {p.city}
        </p>
        <p className="mt-2 text-sm text-[var(--rr-text-tertiary)]">
          {p.specialties.join(" · ")}
        </p>
      </Card>
      <Card>
        <p className="text-sm text-[var(--rr-text-secondary)]">About</p>
        <p className="mt-2 text-sm text-white">
          Cinematic event storytelling with same-day social cuts.
        </p>
      </Card>
    </div>
  );
}`,
});

flowPage({
  slug: "provider-portfolio",
  title: "Portfolio",
  subtitle: "Sample work from this provider",
  next: "/catalogue-selection",
  back: "/provider-details",
  body: `import { mockReels } from "@/lib/mock";
import { Card } from "@/components/ui/Card";

function Inner() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {mockReels.map((r) => (
        <Card
          key={r.id}
          className="flex aspect-square items-end bg-gradient-to-br from-[var(--rr-primary)]/30 to-[var(--rr-card)] p-3"
        >
          <span className="text-xs text-white">{r.title}</span>
        </Card>
      ))}
    </div>
  );
}`,
});

flowPage({
  slug: "catalogue-selection",
  title: "Catalogue",
  subtitle: "Pick a bookable offering",
  next: "/provider-package-pick",
  back: "/provider-portfolio",
  body: `import { Card } from "@/components/ui/Card";
import Link from "next/link";

const items = [
  { name: "Wedding highlight day", price: "₹19,999" },
  { name: "Ceremony only", price: "₹9,999" },
  { name: "Reception social pack", price: "₹7,499" },
];

function Inner() {
  return (
    <div className="space-y-3">
      {items.map((i) => (
        <Link key={i.name} href="/provider-package-pick" className="block">
          <Card className="flex justify-between">
            <span className="text-white">{i.name}</span>
            <span className="text-[var(--rr-secondary)]">{i.price}</span>
          </Card>
        </Link>
      ))}
    </div>
  );
}`,
});

flowPage({
  slug: "provider-package-pick",
  title: "Provider package",
  subtitle: "Confirm package tier with this studio",
  next: "/package-customization",
  back: "/catalogue-selection",
  body: `import { packages } from "@/lib/theme/tokens";
import Link from "next/link";

function Inner() {
  return (
    <div className="space-y-3">
      {packages.map((p) => (
        <Link
          key={p.id}
          href="/package-customization"
          className="block rounded-2xl border border-[var(--rr-outline)]/50 bg-[var(--rr-card)] p-4"
        >
          <p className="font-medium text-white">{p.name}</p>
          <p className="text-sm text-[var(--rr-secondary)]">{p.price}</p>
        </Link>
      ))}
    </div>
  );
}`,
});

flowPage({
  slug: "package-customization",
  title: "Customize",
  subtitle: "Add-ons for your booking",
  next: "/booking-summary",
  back: "/provider-package-pick",
  body: `import { Input } from "@/components/ui/Input";

function Inner() {
  return (
    <div className="space-y-4">
      {["Drone add-on", "Extra editor", "Same-day vertical cut", "Raw footage"].map((a) => (
        <label
          key={a}
          className="flex items-center gap-3 rounded-2xl border border-[var(--rr-outline)]/50 bg-[var(--rr-card)] p-4 text-sm text-white"
        >
          <input type="checkbox" className="accent-[var(--rr-primary)]" /> {a}
        </label>
      ))}
      <Input label="Special requests" placeholder="Family entrance, cake cut…" />
    </div>
  );
}`,
});

flowPage({
  slug: "booking-summary",
  title: "Booking summary",
  subtitle: "Review before payment",
  next: "/payment",
  back: "/package-customization",
  body: `import { Card } from "@/components/ui/Card";

function Inner() {
  return (
    <div className="space-y-3">
      {[
        ["Event", "Priya & Arjun Wedding"],
        ["Package", "Premium Live"],
        ["Provider", "Lens & Light Studio"],
        ["Venue", "Taj Lands End, Mumbai"],
        ["Date", "18 Nov 2026"],
        ["Total", "₹19,999"],
      ].map(([k, v]) => (
        <Card key={k} className="flex justify-between text-sm">
          <span className="text-[var(--rr-text-tertiary)]">{k}</span>
          <span className="text-white">{v}</span>
        </Card>
      ))}
    </div>
  );
}`,
});

flowPage({
  slug: "payment",
  title: "Payment",
  subtitle: "Stripe sandbox placeholder",
  next: "/payment-success",
  back: "/booking-summary",
  nextLabel: "Pay now",
  body: `import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

function Inner() {
  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm text-[var(--rr-text-secondary)]">Amount due</p>
        <p className="text-3xl font-bold text-white">₹19,999</p>
      </Card>
      <Input label="Card number" placeholder="4242 4242 4242 4242" />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Expiry" placeholder="12/28" />
        <Input label="CVC" placeholder="123" />
      </div>
      <p className="text-xs text-[var(--rr-text-tertiary)]">
        Static demo — no charge is processed.{" "}
        <Link href="/payment-failure" className="text-[var(--rr-error)] underline">
          Simulate failure
        </Link>
      </p>
    </div>
  );
}`,
});

flowPage({
  slug: "payment-success",
  title: "Payment successful",
  subtitle: "Your booking is confirmed",
  next: "/my-events",
  back: "/home",
  nextLabel: "Go to My Events",
  body: `import { Card } from "@/components/ui/Card";

function Inner() {
  return (
    <Card className="py-10 text-center">
      <p className="text-4xl">✓</p>
      <p className="mt-4 text-xl font-semibold text-white">Booking confirmed</p>
      <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">Reference RR-2026-118</p>
    </Card>
  );
}`,
});

flowPage({
  slug: "payment-failure",
  title: "Payment failed",
  subtitle: "Try again or use another method",
  next: "/payment",
  back: "/booking-summary",
  nextLabel: "Retry payment",
  body: `import { Card } from "@/components/ui/Card";

function Inner() {
  return (
    <Card className="py-10 text-center">
      <p className="text-4xl text-[var(--rr-error)]">✕</p>
      <p className="mt-4 text-xl font-semibold text-white">Payment failed</p>
      <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">Static demo failure state.</p>
    </Card>
  );
}`,
});

flowPage({
  slug: "booking-confirmation",
  title: "Confirmation",
  subtitle: "Everything is set",
  next: "/my-events",
  nextLabel: "Go to My Events",
  body: `import { Card } from "@/components/ui/Card";

function Inner() {
  return (
    <Card>
      <p className="font-semibold text-white">You are booked</p>
      <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">
        We will notify you as the event approaches.
      </p>
    </Card>
  );
}`,
});

console.log("booking flows done");
