"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/FlowScreen";
import { Badge, Card } from "@/components/ui/Card";
import { AsyncView, Notice } from "@/components/ui/State";
import { listUsers, updateUserProfile } from "@/lib/data/queries";
import { toDate } from "@/lib/data/types";
import { errorMessage, fmtDate, titleCase } from "@/lib/format";
import { useAsync } from "@/lib/hooks";

export default function Page() {
  const state = useAsync(() => listUsers(500), []);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function toggle(id: string, active: boolean) {
    setError(null);
    try {
      await updateUserProfile(id, { isActive: active });
      state.reload();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <div>
      <PageHeader title="User management" subtitle="Customers, providers and admins" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name, phone or email"
        className="mb-4 w-full max-w-md rounded-2xl border border-[var(--rr-outline)] bg-[var(--rr-surface)] px-4 py-3 text-sm text-white outline-none"
      />
      {error ? <Notice>{error}</Notice> : null}
      <AsyncView state={state} empty="No users found.">
        {(rows) => {
          const needle = q.trim().toLowerCase();
          const filtered = rows.filter(
            (u) => !needle || [u.fullName, u.phoneNumber, u.email].some((v) => v?.toLowerCase().includes(needle)),
          );
          return (
            <div className="space-y-2">
              <p className="text-xs text-[var(--rr-text-tertiary)]">{filtered.length} users</p>
              {filtered.map((u) => (
                <Card key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">{u.fullName || "Unnamed"}</p>
                    <p className="text-xs text-[var(--rr-text-tertiary)]">{[u.phoneNumber, u.email].filter(Boolean).join(" · ")}</p>
                    <p className="text-xs text-[var(--rr-text-tertiary)]">Joined {fmtDate(toDate(u.createdAt))}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={u.userType === "customer" ? "muted" : "secondary"}>{titleCase(u.userType)}</Badge>
                    <Badge tone={u.isActive === false ? "warning" : "success"}>{u.isActive === false ? "Suspended" : "Active"}</Badge>
                    {u.userType !== "admin" && u.userType !== "superadmin" ? (
                      <button type="button" className="text-xs text-[var(--rr-secondary)]" onClick={() => toggle(u.id, u.isActive === false)}>
                        {u.isActive === false ? "Reactivate" : "Suspend"}
                      </button>
                    ) : null}
                  </div>
                </Card>
              ))}
            </div>
          );
        }}
      </AsyncView>
    </div>
  );
}
