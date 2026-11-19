"use client";

import Link from "next/link";
import {
  customerGroups,
  customerMobile,
  DashboardShell,
} from "@/components/layout/DashboardShell";

export function CustomerShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      brand="Customer"
      groups={customerGroups}
      mobileTabs={customerMobile}
      action={
        <Link
          href="/event-type-selection"
          className="block rounded-full bg-[var(--color-primary)] px-3 py-2.5 text-center text-sm font-semibold text-white"
        >
          Book event
        </Link>
      }
    >
      {children}
    </DashboardShell>
  );
}
