"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Card";
import { DataTable, TD, TH, THead, TR } from "@/components/ui/DataTable";
import { AsyncView, Notice } from "@/components/ui/State";
import { listAllProviders, updateProvider } from "@/lib/data/queries";
import { errorMessage, titleCase } from "@/lib/format";
import { useAsync } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const FILTERS = ["pending", "approved", "rejected", "all"] as const;

export default function Page() {
  const state = useAsync(listAllProviders, []);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("pending");
  const [error, setError] = useState<string | null>(null);

  async function decide(id: string, approve: boolean) {
    setError(null);
    let reason = "";
    if (!approve) {
      const r = window.prompt("Reason for rejection (shown to the provider)?");
      if (!r) return;
      reason = r;
    }
    try {
      await updateProvider(
        id,
        approve
          ? { verificationStatus: "approved", isVerified: true, isActive: true, rejectionReason: "" }
          : { verificationStatus: "rejected", isVerified: false, rejectionReason: reason },
      );
      state.reload();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <div>
      <PageHeader title="Provider verification" subtitle="Approve or reject provider applications" />
      <div className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={cn("rounded-full px-3 py-1 text-xs capitalize", filter === f ? "bg-[var(--rr-primary)] text-white" : "bg-[var(--rr-card)] text-[var(--rr-text-tertiary)]")}>
            {f}
          </button>
        ))}
      </div>
      {error ? <Notice>{error}</Notice> : null}
      <AsyncView state={state} empty="No providers yet.">
        {(rows) => {
          const filtered = rows.filter((p) => filter === "all" || (p.verificationStatus ?? "pending") === filter);
          if (filtered.length === 0) return <p className="text-sm text-[var(--rr-text-tertiary)]">Nothing in this category.</p>;
          return (
            <DataTable>
              <THead>
                <TH>Studio</TH>
                <TH>Contact</TH>
                <TH>Coverage</TH>
                <TH>Status</TH>
                <TH />
              </THead>
              <tbody>
                {filtered.map((p) => {
                  const veriff = (p.metadata as { veriff?: { status?: string } } | undefined)?.veriff?.status;
                  return (
                    <TR key={p.id}>
                      <TD>
                        <p className="font-medium text-white">{p.businessName || "Unnamed studio"}</p>
                        {p.rejectionReason ? <p className="text-xs text-[var(--rr-error)]">Rejected: {p.rejectionReason}</p> : null}
                      </TD>
                      <TD>{[p.ownerName, p.phoneNumber, p.email].filter(Boolean).join(" · ")}</TD>
                      <TD>{[p.location?.city, p.eventTypes?.join(", ")].filter(Boolean).join(" · ")}</TD>
                      <TD>
                        <div className="flex flex-wrap gap-2">
                          <Badge tone={p.verificationStatus === "approved" ? "success" : p.verificationStatus === "rejected" ? "warning" : "muted"}>{titleCase(p.verificationStatus ?? "pending")}</Badge>
                          {veriff ? <Badge tone="secondary">ID {titleCase(veriff)}</Badge> : <Badge tone="muted">No ID check</Badge>}
                        </div>
                      </TD>
                      <TD>
                        <div className="flex justify-end gap-2">
                          {p.verificationStatus !== "approved" ? <Button type="button" className="px-3 py-1.5 text-xs" onClick={() => decide(p.id, true)}>Approve</Button> : null}
                          {p.verificationStatus !== "rejected" ? <Button type="button" variant="danger" className="px-3 py-1.5 text-xs" onClick={() => decide(p.id, false)}>Reject</Button> : null}
                        </div>
                      </TD>
                    </TR>
                  );
                })}
              </tbody>
            </DataTable>
          );
        }}
      </AsyncView>
    </div>
  );
}
