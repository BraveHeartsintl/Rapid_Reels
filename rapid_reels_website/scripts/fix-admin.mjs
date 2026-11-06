import fs from "fs";
import path from "path";

const root = path.resolve("src/app/(admin)");

function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  console.log("wrote", rel);
}

const pages = {
  "admin-user-management/page.tsx": `import { Badge, Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockUsersAdmin } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Users</h1>
        <Button variant="outline" className="px-3 py-2 text-xs">Static action</Button>
      </div>
      {mockUsersAdmin.map((u) => (
        <Card key={u.id} className="mb-2 flex justify-between text-sm">
          <div>
            <p className="text-white">{u.name}</p>
            <p className="text-xs text-[var(--rr-text-tertiary)]">{u.role} · {u.city}</p>
          </div>
          <Badge tone={u.status === "active" ? "success" : "warning"}>{u.status}</Badge>
        </Card>
      ))}
    </div>
  );
}
`,
  "admin-booking-management/page.tsx": `import { Badge, Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockBookings } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Bookings</h1>
        <Button variant="outline" className="px-3 py-2 text-xs">Static action</Button>
      </div>
      {mockBookings.map((b) => (
        <Card key={b.id} className="mb-2 flex justify-between text-sm">
          <div>
            <p className="text-white">{b.title}</p>
            <p className="text-xs text-[var(--rr-text-tertiary)]">{b.date} · {b.amount}</p>
          </div>
          <Badge>{b.status}</Badge>
        </Card>
      ))}
    </div>
  );
}
`,
  "admin-provider-verification/page.tsx": `import { Badge, Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockProviders } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Provider verification</h1>
        <Button variant="outline" className="px-3 py-2 text-xs">Static action</Button>
      </div>
      {mockProviders.map((p) => (
        <Card key={p.id} className="mb-2 flex items-center justify-between text-sm">
          <p className="text-white">{p.name}</p>
          <div className="flex gap-2">
            <Badge tone={p.verified ? "success" : "warning"}>
              {p.verified ? "verified" : "pending"}
            </Badge>
            <Button className="px-3 py-1 text-xs">Review</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
`,
  "admin-content-moderation/page.tsx": `import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockReels } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Content moderation</h1>
        <Button variant="outline" className="px-3 py-2 text-xs">Static action</Button>
      </div>
      {mockReels.map((r) => (
        <Card key={r.id} className="mb-2 flex justify-between text-sm">
          <p className="text-white">{r.title}</p>
          <Button className="px-3 py-1 text-xs" variant="outline">Moderate</Button>
        </Card>
      ))}
    </div>
  );
}
`,
  "admin-reel-approval/page.tsx": `import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockReels } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Reel approval</h1>
        <Button variant="outline" className="px-3 py-2 text-xs">Static action</Button>
      </div>
      {mockReels.map((r) => (
        <Card key={r.id} className="mb-2 flex justify-between text-sm">
          <p className="text-white">{r.title}</p>
          <Button className="px-3 py-1 text-xs" variant="outline">Approve</Button>
        </Card>
      ))}
    </div>
  );
}
`,
  "admin-reviews-moderation/page.tsx": `import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function Page() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Reviews moderation</h1>
        <Button variant="outline" className="px-3 py-2 text-xs">Static action</Button>
      </div>
      <Card className="text-sm text-white">★ 4.8 — “Amazing same-day reels” — awaiting approval</Card>
    </div>
  );
}
`,
  "admin-content-reports/page.tsx": `import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockReels } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Content reports</h1>
        <Button variant="outline" className="px-3 py-2 text-xs">Static action</Button>
      </div>
      {mockReels.map((r) => (
        <Card key={r.id} className="mb-2 flex justify-between text-sm">
          <p className="text-white">Report: {r.title}</p>
          <Button className="px-3 py-1 text-xs" variant="outline">Review</Button>
        </Card>
      ))}
    </div>
  );
}
`,
  "admin-offers-management/page.tsx": `import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockOffers } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Offers</h1>
        <Button variant="outline" className="px-3 py-2 text-xs">Static action</Button>
      </div>
      {mockOffers.map((o) => (
        <Card key={o.id} className="mb-2 text-sm">
          <p className="text-white">{o.title}</p>
          <p className="text-[var(--rr-secondary)]">{o.code}</p>
        </Card>
      ))}
    </div>
  );
}
`,
  "admin-payment-management/page.tsx": `import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockBookings } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Payments</h1>
        <Button variant="outline" className="px-3 py-2 text-xs">Static action</Button>
      </div>
      {mockBookings.map((b) => (
        <Card key={b.id} className="mb-2 flex justify-between text-sm">
          <p className="text-white">{b.title}</p>
          <p className="text-[var(--rr-success)]">{b.amount}</p>
        </Card>
      ))}
    </div>
  );
}
`,
  "admin-provider-earnings/page.tsx": `import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockEarnings } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Provider earnings</h1>
        <Button variant="outline" className="px-3 py-2 text-xs">Static action</Button>
      </div>
      {mockEarnings.map((e) => (
        <Card key={e.month} className="mb-2 flex justify-between text-sm">
          <p className="text-white">{e.month}</p>
          <p className="text-white">₹{e.amount.toLocaleString()}</p>
        </Card>
      ))}
    </div>
  );
}
`,
  "admin-analytics/page.tsx": `import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function Page() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Analytics</h1>
        <Button variant="outline" className="px-3 py-2 text-xs">Static action</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-[var(--rr-text-tertiary)]">DAU</p>
          <p className="text-2xl font-bold text-white">4,210</p>
        </Card>
        <Card>
          <p className="text-xs text-[var(--rr-text-tertiary)]">Bookings / wk</p>
          <p className="text-2xl font-bold text-white">186</p>
        </Card>
        <Card>
          <p className="text-xs text-[var(--rr-text-tertiary)]">Avg delivery</p>
          <p className="text-2xl font-bold text-white">22m</p>
        </Card>
      </div>
    </div>
  );
}
`,
  "admin-booking-drive/page.tsx": `import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function Page() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Booking drive</h1>
        <Button variant="outline" className="px-3 py-2 text-xs">Static action</Button>
      </div>
      <Card className="text-sm text-[var(--rr-text-secondary)]">
        Shared booking drive files placeholder for admin oversight.
      </Card>
    </div>
  );
}
`,
};

for (const [rel, content] of Object.entries(pages)) {
  write(rel, content);
}

console.log("admin fixed");
