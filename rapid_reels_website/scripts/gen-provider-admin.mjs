import fs from "fs";
import path from "path";

const root = path.resolve("src/app");

function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  console.log("wrote", rel);
}

write(
  "(provider)/layout.tsx",
  `import { ProviderShell } from "@/components/layout/ProviderShell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ProviderShell>{children}</ProviderShell>;
}
`,
);

const providerPortal = {
  home: `import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockBookings, mockEarnings } from "@/lib/mock";

export default function Page() {
  const next = mockBookings[0];
  const latest = mockEarnings[mockEarnings.length - 1];
  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Today</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-[var(--rr-text-tertiary)]">Next booking</p>
          <p className="mt-2 font-medium text-white">{next.title}</p>
          <p className="text-xs text-[var(--rr-text-secondary)]">{next.date}</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--rr-text-tertiary)]">Month earnings</p>
          <p className="mt-2 text-2xl font-bold text-white">₹{latest.amount.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--rr-text-tertiary)]">Quick actions</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button href="/live-event-mode" className="text-xs px-3 py-2">Live mode</Button>
            <Button href="/provider-catalogue" variant="outline" className="text-xs px-3 py-2">Catalogue</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
`,
  schedule: `import { Card } from "@/components/ui/Card";
import { mockBookings } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-white">Schedule</h1>
      <div className="mb-4 grid grid-cols-7 gap-2 text-center text-xs text-[var(--rr-text-tertiary)]">
        {["M","T","W","T","F","S","S"].map((d,i) => <div key={i}>{d}</div>)}
        {Array.from({length: 28}, (_,i) => (
          <div key={i} className={"rounded-lg py-3 " + (i === 16 ? "bg-[var(--rr-primary)] text-white" : "bg-[var(--rr-card)]")}>{i+1}</div>
        ))}
      </div>
      {mockBookings.filter(b => b.status !== "cancelled").map((b) => (
        <Card key={b.id} className="mb-3">
          <p className="text-white">{b.title}</p>
          <p className="text-xs text-[var(--rr-text-tertiary)]">{b.date} · {b.venue}</p>
        </Card>
      ))}
    </div>
  );
}
`,
  bookings: `import Link from "next/link";
import { Badge, Card } from "@/components/ui/Card";
import { mockBookings } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-white">Bookings</h1>
      {mockBookings.map((b) => (
        <Link key={b.id} href="/provider-booking-timeline">
          <Card className="mb-3 flex justify-between">
            <div>
              <p className="text-white">{b.title}</p>
              <p className="text-xs text-[var(--rr-text-tertiary)]">{b.date} · {b.amount}</p>
            </div>
            <Badge>{b.status}</Badge>
          </Card>
        </Link>
      ))}
    </div>
  );
}
`,
  earnings: `import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockEarnings } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-white">Earnings</h1>
      <div className="grid gap-3 sm:grid-cols-4">
        {mockEarnings.map((e) => (
          <Card key={e.month}>
            <p className="text-xs text-[var(--rr-text-tertiary)]">{e.month}</p>
            <p className="mt-2 text-xl font-semibold text-white">₹{e.amount.toLocaleString()}</p>
          </Card>
        ))}
      </div>
      <Button href="/provider-bank-details" className="mt-6" variant="outline">Bank details</Button>
    </div>
  );
}
`,
  account: `import Link from "next/link";

const links = [
  ["/provider-business-profile", "Business profile"],
  ["/provider-portfolio-upload", "Portfolio"],
  ["/provider-service-areas", "Service areas"],
  ["/provider-availability-calendar", "Availability"],
  ["/provider-catalogue", "Catalogue"],
  ["/provider-verification", "Verification"],
  ["/provider-document-upload", "Documents"],
  ["/provider-my-reels", "My reels"],
];

export default function Page() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-white">Account</h1>
      <div className="space-y-2">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className="flex justify-between rounded-2xl bg-[var(--rr-card)] px-4 py-3 text-sm text-white">
            {label}<span>→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
`,
};

for (const [tab, content] of Object.entries(providerPortal)) {
  write(`(provider)/provider-portal/demo/${tab}/page.tsx`, content);
}

// Provider onboarding + ops (no portal shell — standalone flow screens)
const flowish = [
  ["provider-business-profile", "Business profile", "/provider-portfolio-upload"],
  ["provider-portfolio-upload", "Upload portfolio", "/provider-service-areas"],
  ["provider-service-areas", "Service areas", "/provider-document-upload"],
  ["provider-document-upload", "Documents", "/provider-availability-calendar"],
  ["provider-availability-calendar", "Availability", "/provider-verification"],
  ["provider-verification", "Verification", "/provider-catalogue"],
  ["provider-catalogue", "Catalogue", "/provider-catalogue-edit"],
  ["provider-catalogue-edit", "Edit offering", "/provider-portal/demo/home"],
  ["provider-bank-details", "Bank details", "/provider-portal/demo/earnings"],
  ["provider-booking-timeline", "Booking timeline", "/provider-customer-contact"],
  ["provider-customer-contact", "Customer contact", "/provider-venue-navigation"],
  ["provider-venue-navigation", "Venue navigation", "/provider-pre-event-checklist"],
  ["provider-pre-event-checklist", "Pre-event checklist", "/provider-booking-status"],
  ["provider-booking-status", "Booking status", "/live-event-mode"],
  ["provider-booking-drive", "Booking drive", "/provider-portal/demo/bookings"],
  ["live-event-mode", "Live event mode", "/reel-editor"],
  ["reel-editor", "Reel editor", "/upload-footage"],
  ["upload-footage", "Upload footage", "/provider-my-reels"],
  ["provider-my-reels", "Provider reels", "/provider-portal/demo/home"],
  ["provider-bookings", "All bookings", "/provider-portal/demo/bookings"],
  ["provider-earnings", "Earnings detail", "/provider-portal/demo/earnings"],
  ["provider-booking-calendar", "Booking calendar", "/provider-portal/demo/schedule"],
  ["provider-dashboard", "Provider dashboard", "/provider-portal/demo/home"],
];

for (const [slug, title, next] of flowish) {
  write(
    `${slug}/page.tsx`,
    `import { FlowScreen } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function Page() {
  return (
    <FlowScreen
      title="${title}"
      subtitle="Static provider flow demo"
      backHref="/provider-portal/demo/account"
      nextHref="${next}"
      nextLabel="Continue"
    >
      <div className="space-y-4">
        <Card>
          <p className="text-sm text-[var(--rr-text-secondary)]">
            ${title} screen with mock controls. No uploads or API calls in this phase.
          </p>
        </Card>
        <Input label="Notes" placeholder="Optional notes for this step" />
        <label className="flex items-center gap-3 rounded-2xl border border-[var(--rr-outline)]/50 bg-[var(--rr-card)] p-4 text-sm text-white">
          <input type="checkbox" className="accent-[var(--rr-primary)]" defaultChecked /> Mark step complete
        </label>
      </div>
    </FlowScreen>
  );
}
`,
  );
}

// Admin
write(
  "(admin)/layout.tsx",
  `import { AdminShell } from "@/components/layout/AdminShell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
`,
);

write(
  "(admin)/admin-dashboard/page.tsx",
  `import { Card } from "@/components/ui/Card";
import { mockAdminStats } from "@/lib/mock";
import Link from "next/link";

const tiles = [
  ["Users", mockAdminStats.users, "/admin-user-management"],
  ["Providers", mockAdminStats.providers, "/admin-provider-verification"],
  ["Bookings", mockAdminStats.bookings, "/admin-booking-management"],
  ["Reels", mockAdminStats.reels, "/admin-reel-approval"],
  ["Revenue", mockAdminStats.revenue, "/admin-payment-management"],
  ["Pending verify", mockAdminStats.pendingVerifications, "/admin-provider-verification"],
  ["Flagged", mockAdminStats.flaggedContent, "/admin-content-reports"],
];

export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Admin dashboard</h1>
      <p className="mt-1 text-sm text-[var(--rr-text-secondary)]">Platform overview (mock)</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(([label, value, href]) => (
          <Link key={label} href={href}>
            <Card>
              <p className="text-xs text-[var(--rr-text-tertiary)]">{label}</p>
              <p className="mt-2 text-2xl font-bold text-white">{value}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
`,
);

const adminModules = [
  ["admin-user-management", "Users", "table-users"],
  ["admin-booking-management", "Bookings", "table-bookings"],
  ["admin-provider-verification", "Provider verification", "verify"],
  ["admin-content-moderation", "Content moderation", "mod"],
  ["admin-reel-approval", "Reel approval", "reels"],
  ["admin-reviews-moderation", "Reviews moderation", "reviews"],
  ["admin-content-reports", "Content reports", "reports"],
  ["admin-offers-management", "Offers", "offers"],
  ["admin-payment-management", "Payments", "payments"],
  ["admin-provider-earnings", "Provider earnings", "earnings"],
  ["admin-analytics", "Analytics", "analytics"],
  ["admin-booking-drive", "Booking drive", "drive"],
];

for (const [slug, title, kind] of adminModules) {
  write(
    `(admin)/${slug}/page.tsx`,
    `import { Badge, Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockBookings, mockProviders, mockReels, mockUsersAdmin, mockOffers, mockEarnings } from "@/lib/mock";

export default function Page() {
  const kind = "${kind}";
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">${title}</h1>
        <Button variant="outline" className="text-xs px-3 py-2">Static action</Button>
      </div>
      {kind === "table-users" && mockUsersAdmin.map((u) => (
        <Card key={u.id} className="mb-2 flex justify-between text-sm">
          <div>
            <p className="text-white">{u.name}</p>
            <p className="text-xs text-[var(--rr-text-tertiary)]">{u.role} · {u.city}</p>
          </div>
          <Badge tone={u.status === "active" ? "success" : "warning"}>{u.status}</Badge>
        </Card>
      ))}
      {kind === "table-bookings" && mockBookings.map((b) => (
        <Card key={b.id} className="mb-2 flex justify-between text-sm">
          <div>
            <p className="text-white">{b.title}</p>
            <p className="text-xs text-[var(--rr-text-tertiary)]">{b.date} · {b.amount}</p>
          </div>
          <Badge>{b.status}</Badge>
        </Card>
      ))}
      {kind === "verify" && mockProviders.map((p) => (
        <Card key={p.id} className="mb-2 flex items-center justify-between text-sm">
          <p className="text-white">{p.name}</p>
          <div className="flex gap-2">
            <Badge tone={p.verified ? "success" : "warning"}>{p.verified ? "verified" : "pending"}</Badge>
            <Button className="px-3 py-1 text-xs">Review</Button>
          </div>
        </Card>
      ))}
      {(kind === "mod" || kind === "reels" || kind === "reports") && mockReels.map((r) => (
        <Card key={r.id} className="mb-2 flex justify-between text-sm">
          <p className="text-white">{r.title}</p>
          <Button className="px-3 py-1 text-xs" variant="outline">Moderate</Button>
        </Card>
      ))}
      {kind === "reviews" && (
        <Card className="text-sm text-white">★ 4.8 — “Amazing same-day reels” — awaiting approval</Card>
      )}
      {kind === "offers" && mockOffers.map((o) => (
        <Card key={o.id} className="mb-2 text-sm">
          <p className="text-white">{o.title}</p>
          <p className="text-[var(--rr-secondary)]">{o.code}</p>
        </Card>
      ))}
      {kind === "payments" && mockBookings.map((b) => (
        <Card key={b.id} className="mb-2 flex justify-between text-sm">
          <p className="text-white">{b.title}</p>
          <p className="text-[var(--rr-success)]">{b.amount}</p>
        </Card>
      ))}
      {kind === "earnings" && mockEarnings.map((e) => (
        <Card key={e.month} className="mb-2 flex justify-between text-sm">
          <p className="text-white">{e.month}</p>
          <p className="text-white">₹{e.amount.toLocaleString()}</p>
        </Card>
      ))}
      {kind === "analytics" && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card><p className="text-xs text-[var(--rr-text-tertiary)]">DAU</p><p className="text-2xl font-bold text-white">4,210</p></Card>
          <Card><p className="text-xs text-[var(--rr-text-tertiary)]">Bookings / wk</p><p className="text-2xl font-bold text-white">186</p></Card>
          <Card><p className="text-xs text-[var(--rr-text-tertiary)]">Avg delivery</p><p className="text-2xl font-bold text-white">22m</p></Card>
        </div>
      )}
      {kind === "drive" && (
        <Card className="text-sm text-[var(--rr-text-secondary)]">
          Shared booking drive files placeholder for admin oversight.
        </Card>
      )}
    </div>
  );
}
`,
  );
}

// Legal
const legal = {
  "legal/terms": {
    title: "Terms of service",
    body: "This is a short static summary for the Rapid Reels marketing/demo website. Full contractual terms ship with the mobile app. By using this demo you acknowledge it is non-production and uses mock data only.",
  },
  "legal/privacy": {
    title: "Privacy policy",
    body: "This static site does not collect personal data or connect to Firebase. The production Rapid Reels app processes account, booking, and media data under its published privacy policy.",
  },
  "legal/refund": {
    title: "Refund & cancellation",
    body: "Cancellation and refund rules depend on package tier and timing relative to the event. This page is a placeholder summary for the static website; see in-app legal documents for binding policy.",
  },
  "cookie-preferences": {
    title: "Cookie preferences",
    body: "This demo uses essential cookies only for Next.js operation. Analytics cookies are not enabled in the static phase.",
  },
  unauthorized: {
    title: "Unauthorized",
    body: "You do not have access to this area in the static demo.",
  },
  "booking-drive": {
    title: "Booking drive",
    body: "Shared media drive for a booking — static placeholder.",
  },
};

for (const [slug, { title, body }] of Object.entries(legal)) {
  write(
    `${slug}/page.tsx`,
    `import { MarketingFooter, MarketingNav } from "@/components/layout/MarketingChrome";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "${title}" };

export default function Page() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6">
        <h1 className="text-3xl font-bold text-white">${title}</h1>
        <p className="mt-6 text-[var(--rr-text-secondary)] leading-relaxed">${body}</p>
        <Button href="/" className="mt-10" variant="outline">Back home</Button>
      </main>
      <MarketingFooter />
    </div>
  );
}
`,
  );
}

write(
  "terms-privacy/page.tsx",
  `import { redirect } from "next/navigation";
export default function Page() { redirect("/legal/terms"); }
`,
);

write(
  "refund-cancellation-policy/page.tsx",
  `import { redirect } from "next/navigation";
export default function Page() { redirect("/legal/refund"); }
`,
);

write(
  "legal-documents/page.tsx",
  `import { MarketingFooter, MarketingNav } from "@/components/layout/MarketingChrome";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <main className="mx-auto max-w-lg px-4 pb-20 pt-28">
        <h1 className="text-3xl font-bold text-white">Legal documents</h1>
        <ul className="mt-8 space-y-3 text-sm">
          <li><Link className="text-[var(--rr-secondary)]" href="/legal/terms">Terms</Link></li>
          <li><Link className="text-[var(--rr-secondary)]" href="/legal/privacy">Privacy</Link></li>
          <li><Link className="text-[var(--rr-secondary)]" href="/legal/refund">Refunds</Link></li>
        </ul>
      </main>
      <MarketingFooter />
    </div>
  );
}
`,
);

console.log("provider + admin + legal done");
