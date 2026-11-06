import fs from "fs";
import path from "path";

const root = path.resolve("src/app");

function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  console.log("wrote", rel);
}

// Customer secondary pages (inside customer group for shell)
const customerPages = {
  "edit-profile": `import { PageHeader } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { mockUser } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <PageHeader title="Edit profile" />
      <div className="space-y-4">
        <Input label="Full name" defaultValue={mockUser.name} />
        <Input label="Email" defaultValue={mockUser.email} />
        <Input label="Phone" defaultValue={mockUser.phone} />
        <Button href="/profile" className="w-full">Save (static)</Button>
      </div>
    </div>
  );
}
`,
  "saved-venues": `import { PageHeader } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";
import { mockVenues } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <PageHeader title="Saved venues" />
      <div className="space-y-3">
        {mockVenues.map((v) => (
          <Card key={v}><p className="text-sm text-white">{v}</p></Card>
        ))}
      </div>
    </div>
  );
}
`,
  wallet: `import { PageHeader } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockTransactions, mockUser } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <PageHeader title="Wallet" subtitle="Balance and history" />
      <Card className="mb-6">
        <p className="text-sm text-[var(--rr-text-secondary)]">Available</p>
        <p className="text-3xl font-bold text-white">₹{mockUser.walletBalance}</p>
        <Button href="/redemption" className="mt-4" variant="outline">Redeem</Button>
      </Card>
      <h2 className="mb-3 text-sm font-semibold text-[var(--rr-text-secondary)]">Recent</h2>
      {mockTransactions.map((t) => (
        <Card key={t.id} className="mb-2 flex justify-between text-sm">
          <span className="text-white">{t.label}</span>
          <span className={t.amount > 0 ? "text-[var(--rr-success)]" : "text-white"}>
            {t.amount > 0 ? "+" : ""}{t.amount}
          </span>
        </Card>
      ))}
    </div>
  );
}
`,
  "referral-dashboard": `import { PageHeader } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockUser } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <PageHeader title="Referrals" subtitle="Invite friends, earn wallet credit" />
      <Card className="mb-4 text-center">
        <p className="text-sm text-[var(--rr-text-secondary)]">Your code</p>
        <p className="mt-2 text-2xl font-bold text-[var(--rr-secondary)]">{mockUser.referralCode}</p>
        <Button href="/referral-history" className="mt-4" variant="outline">View history</Button>
      </Card>
      <p className="text-sm text-[var(--rr-text-tertiary)]">Share via WhatsApp / Instagram (static share sheet placeholder).</p>
    </div>
  );
}
`,
  "referral-history": `import { PageHeader } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";

export default function Page() {
  return (
    <div>
      <PageHeader title="Referral history" />
      {["Neha joined — ₹250", "Rahul pending", "Priya joined — ₹250"].map((r) => (
        <Card key={r} className="mb-2 text-sm text-white">{r}</Card>
      ))}
    </div>
  );
}
`,
  redemption: `import { PageHeader } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function Page() {
  return (
    <div>
      <PageHeader title="Redeem wallet" />
      <Input label="Amount" type="number" defaultValue="500" />
      <Button href="/wallet" className="mt-4 w-full">Apply to next booking</Button>
    </div>
  );
}
`,
  "my-transactions": `import { PageHeader } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";
import { mockTransactions } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <PageHeader title="Transactions" />
      {mockTransactions.map((t) => (
        <Card key={t.id} className="mb-2 flex justify-between text-sm">
          <div>
            <p className="text-white">{t.label}</p>
            <p className="text-xs text-[var(--rr-text-tertiary)]">{t.date}</p>
          </div>
          <span className="text-white">₹{Math.abs(t.amount)}</span>
        </Card>
      ))}
    </div>
  );
}
`,
  settings: `import { PageHeader } from "@/components/layout/FlowScreen";
import Link from "next/link";

const items = [
  ["/payment-methods", "Payment methods"],
  ["/cookie-preferences", "Cookie preferences"],
  ["/legal/terms", "Terms & privacy"],
  ["/help-support", "Help & support"],
];

export default function Page() {
  return (
    <div>
      <PageHeader title="Settings" />
      <div className="space-y-2">
        {items.map(([href, label]) => (
          <Link key={href} href={href} className="flex justify-between rounded-2xl bg-[var(--rr-card)] px-4 py-3 text-sm text-white">
            {label}<span className="text-[var(--rr-text-tertiary)]">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
`,
  "payment-methods": `import { PageHeader } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";

export default function Page() {
  return (
    <div>
      <PageHeader title="Payment methods" />
      <Card className="mb-3 text-sm text-white">Visa ···· 4242</Card>
      <Card className="text-sm text-white">UPI · aisha@oksbi</Card>
    </div>
  );
}
`,
  "help-support": `import { PageHeader } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function Page() {
  return (
    <div>
      <PageHeader title="Help & support" />
      <Input label="Subject" placeholder="Booking issue" />
      <label className="mt-4 flex flex-col gap-1.5 text-sm">
        <span className="text-[var(--rr-text-secondary)]">Message</span>
        <textarea className="min-h-28 rounded-2xl border border-[var(--rr-outline)] bg-[var(--rr-surface)] px-4 py-3 text-white" />
      </label>
      <Button href="/my-tickets" className="mt-4 w-full">Submit ticket</Button>
    </div>
  );
}
`,
  "my-tickets": `import { PageHeader } from "@/components/layout/FlowScreen";
import { Badge, Card } from "@/components/ui/Card";

export default function Page() {
  return (
    <div>
      <PageHeader title="My tickets" />
      <Card className="flex justify-between">
        <div>
          <p className="text-sm text-white">Payment receipt missing</p>
          <p className="text-xs text-[var(--rr-text-tertiary)]">#T-1042</p>
        </div>
        <Badge tone="warning">Open</Badge>
      </Card>
    </div>
  );
}
`,
  "event-details-view": `import { PageHeader } from "@/components/layout/FlowScreen";
import { Badge, Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockBookings } from "@/lib/mock";

export default function Page() {
  const b = mockBookings[0];
  return (
    <div>
      <PageHeader title={b.title} subtitle={b.venue} action={<Badge>{b.status}</Badge>} />
      <Card className="mb-3 space-y-2 text-sm">
        <p className="text-[var(--rr-text-tertiary)]">Date · <span className="text-white">{b.date}</span></p>
        <p className="text-[var(--rr-text-tertiary)]">Provider · <span className="text-white">{b.provider}</span></p>
        <p className="text-[var(--rr-text-tertiary)]">Amount · <span className="text-white">{b.amount}</span></p>
      </Card>
      <div className="flex flex-col gap-2">
        <Button href="/live-event-tracking">Live tracking</Button>
        <Button href="/event-tracking" variant="outline">Event timeline</Button>
        <Button href="/reels" variant="ghost">View reels</Button>
      </div>
    </div>
  );
}
`,
  "event-tracking": `import { PageHeader } from "@/components/layout/FlowScreen";
import { mockTimeline } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <PageHeader title="Event timeline" />
      <ol className="space-y-4">
        {mockTimeline.map((t) => (
          <li key={t.time} className="flex gap-4">
            <span className="w-12 text-xs text-[var(--rr-secondary)]">{t.time}</span>
            <span className={t.done ? "text-[var(--rr-text-tertiary)] line-through" : "text-white"}>{t.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
`,
  "live-event-tracking": `import { PageHeader } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Card";

export default function Page() {
  return (
    <div>
      <PageHeader title="Live event" action={<Badge tone="warning">LIVE</Badge>} />
      <Card className="mb-4">
        <p className="text-sm text-[var(--rr-text-secondary)]">Crew on site</p>
        <p className="mt-2 text-white">Lens & Light Studio · 2 shooters</p>
      </Card>
      <Card>
        <p className="text-sm text-white">Latest reel delivered 12 min ago</p>
        <a href="/reel-player" className="mt-3 inline-block text-sm text-[var(--rr-secondary)]">Watch →</a>
      </Card>
    </div>
  );
}
`,
  "reel-player": `import { PageHeader } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { mockReels } from "@/lib/mock";

export default function Page() {
  const r = mockReels[0];
  return (
    <div>
      <PageHeader title={r.title} subtitle={r.author} />
      <div className="mb-4 flex aspect-[9/16] max-h-[60vh] items-center justify-center rounded-2xl bg-gradient-to-b from-[var(--rr-primary)]/40 to-[var(--rr-surface)] text-[var(--rr-text-tertiary)]">
        Video player placeholder
      </div>
      <p className="text-sm text-[var(--rr-text-secondary)]">♥ {r.likes} · 💬 {r.comments}</p>
      <div className="mt-4 flex gap-2">
        <Button href="/reel-details" variant="outline">Details</Button>
        <Button href="/reel-share">Share</Button>
      </div>
    </div>
  );
}
`,
  "reel-details": `import { PageHeader } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";
import { mockReels } from "@/lib/mock";

export default function Page() {
  const r = mockReels[0];
  return (
    <div>
      <PageHeader title="Reel details" />
      <Card className="space-y-2 text-sm">
        <p className="text-white">{r.title}</p>
        <p className="text-[var(--rr-text-tertiary)]">{r.eventType} · {r.author}</p>
        <p className="text-[var(--rr-text-secondary)]">Captured during live coverage and delivered in under 30 minutes.</p>
      </Card>
    </div>
  );
}
`,
  "reel-share": `import { PageHeader } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";

export default function Page() {
  return (
    <div>
      <PageHeader title="Share reel" subtitle="Native share sheet placeholder" />
      <div className="flex flex-col gap-2">
        <Button variant="outline">WhatsApp</Button>
        <Button variant="outline">Instagram</Button>
        <Button variant="ghost" href="/discover">Done</Button>
      </div>
    </div>
  );
}
`,
};

for (const [slug, content] of Object.entries(customerPages)) {
  write(`(customer)/${slug}/page.tsx`, content);
}

console.log("customer secondary done");
