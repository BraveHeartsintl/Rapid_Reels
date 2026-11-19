"use client";

import { adminGroups, DashboardShell } from "@/components/layout/DashboardShell";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell brand="Admin" groups={adminGroups} mobile="scroll">
      {children}
    </DashboardShell>
  );
}
