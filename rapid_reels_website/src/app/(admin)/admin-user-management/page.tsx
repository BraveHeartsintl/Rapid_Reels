"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/FlowScreen";
import { Badge } from "@/components/ui/Card";
import { DataTable, TD, TH, THead, TR } from "@/components/ui/DataTable";
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
        className="mb-4 h-12 w-full max-w-md rounded-[var(--radius-sm)] border border-[var(--rr-outline)] bg-[var(--rr-surface)] px-4 text-sm text-white outline-none"
      />
      {error ? <Notice>{error}</Notice> : null}
      <AsyncView state={state} empty="No users found.">
        {(rows) => {
          const needle = q.trim().toLowerCase();
          const filtered = rows.filter(
            (u) => !needle || [u.fullName, u.phoneNumber, u.email].some((v) => v?.toLowerCase().includes(needle)),
          );
          return (
            <div className="space-y-3">
              <p className="text-sm text-[var(--rr-text-tertiary)]">{filtered.length} users</p>
              <DataTable>
                <THead>
                  <TH>Name</TH>
                  <TH>Contact</TH>
                  <TH>Joined</TH>
                  <TH>Role</TH>
                  <TH>Status</TH>
                  <TH />
                </THead>
                <tbody>
                  {filtered.map((u) => (
                    <TR key={u.id}>
                      <TD className="font-medium text-white">{u.fullName || "Unnamed"}</TD>
                      <TD>{[u.phoneNumber, u.email].filter(Boolean).join(" · ")}</TD>
                      <TD>{fmtDate(toDate(u.createdAt))}</TD>
                      <TD><Badge tone={u.userType === "customer" ? "muted" : "secondary"}>{titleCase(u.userType)}</Badge></TD>
                      <TD><Badge tone={u.isActive === false ? "warning" : "success"}>{u.isActive === false ? "Suspended" : "Active"}</Badge></TD>
                      <TD>
                        {u.userType !== "admin" && u.userType !== "superadmin" ? (
                          <button type="button" className="text-sm font-semibold text-[var(--rr-secondary)]" onClick={() => toggle(u.id, u.isActive === false)}>
                            {u.isActive === false ? "Reactivate" : "Suspend"}
                          </button>
                        ) : null}
                      </TD>
                    </TR>
                  ))}
                </tbody>
              </DataTable>
            </div>
          );
        }}
      </AsyncView>
    </div>
  );
}
