"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";
import { AsyncView } from "@/components/ui/State";
import { getAdminStats } from "@/lib/data/queries";
import { fmtMoney } from "@/lib/format";
import { useAsync } from "@/lib/hooks";

export default function Page() {
  const state = useAsync(getAdminStats, []);

  return (
    <div>
      <PageHeader title="Admin dashboard" subtitle="Live platform overview" />
      <AsyncView state={state} isEmpty={() => false}>
        {(s) => {
          const tiles: Array<{ label: string; value: string | number; href: string; alert?: boolean }> = [
            { label: "Users", value: s.users, href: "/admin-user-management" },
            { label: "Providers", value: s.providers, href: "/admin-provider-verification" },
            { label: "Bookings", value: s.bookings, href: "/admin-booking-management" },
            { label: "Reels", value: s.reels, href: "/admin-reel-approval" },
            { label: "Revenue", value: fmtMoney(s.revenue), href: "/admin-payment-management" },
            { label: "Pending verification", value: s.pendingVerifications, href: "/admin-provider-verification", alert: s.pendingVerifications > 0 },
            { label: "Reels to review", value: s.pendingReels, href: "/admin-reel-approval", alert: s.pendingReels > 0 },
            { label: "Open reports", value: s.openReports, href: "/admin-content-reports", alert: s.openReports > 0 },
          ];
          return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {tiles.map((t) => (
                <Link key={t.label} href={t.href}>
                  <Card className={t.alert ? "border-[var(--rr-warning)]/60" : undefined}>
                    <p className="text-xs text-[var(--rr-text-tertiary)]">{t.label}</p>
                    <p className="mt-2 text-2xl font-bold text-white">{t.value}</p>
                  </Card>
                </Link>
              ))}
            </div>
          );
        }}
      </AsyncView>
    </div>
  );
}
