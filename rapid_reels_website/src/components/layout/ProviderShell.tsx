"use client";

import { DashboardShell, providerGroups, providerMobile } from "@/components/layout/DashboardShell";

export function ProviderShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell brand="Provider" groups={providerGroups} mobileTabs={providerMobile}>
      {children}
    </DashboardShell>
  );
}
