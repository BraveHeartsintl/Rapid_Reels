"use client";

import { useState } from "react";
import { FlowScreen } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Badge, Card } from "@/components/ui/Card";
import { AsyncView, Notice } from "@/components/ui/State";
import { useProviderDoc } from "@/lib/auth/useProviderDoc";
import { createVeriffSession } from "@/lib/data/queries";
import { errorMessage, titleCase } from "@/lib/format";

export default function Page() {
  const state = useProviderDoc();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      window.location.href = await createVeriffSession();
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  return (
    <FlowScreen title="Verification" subtitle="Identity verification is required before customers can book you" backHref="/provider-dashboard">
      <AsyncView state={state} empty="Provider profile not found." isEmpty={(d) => !d}>
        {(p) => {
          const veriff = (p.metadata as { veriff?: { status?: string } } | undefined)?.veriff;
          const approved = p.verificationStatus === "approved";
          return (
            <div className="space-y-4">
              <Card className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--rr-text-secondary)]">Status</span>
                  <Badge tone={approved ? "success" : p.verificationStatus === "rejected" ? "warning" : "muted"}>
                    {titleCase(p.verificationStatus ?? "pending")}
                  </Badge>
                </div>
                {veriff?.status ? <p className="text-xs text-[var(--rr-text-tertiary)]">Identity check: {titleCase(veriff.status)}</p> : null}
                {p.rejectionReason ? <p className="text-xs text-[var(--rr-error)]">{p.rejectionReason}</p> : null}
              </Card>
              {approved ? (
                <Notice tone="success">You are verified and visible to customers.</Notice>
              ) : (
                <>
                  <p className="text-sm text-[var(--rr-text-secondary)]">
                    You will be taken to Veriff to scan your ID and take a selfie. Come back here afterwards; our team reviews the result.
                  </p>
                  {error ? <Notice>{error}</Notice> : null}
                  <Button type="button" className="w-full" disabled={busy} onClick={start}>
                    {busy ? "Opening…" : veriff?.status ? "Restart identity check" : "Start identity check"}
                  </Button>
                </>
              )}
              <Button href="/provider-document-upload" variant="ghost" className="w-full">Document requirements</Button>
            </div>
          );
        }}
      </AsyncView>
    </FlowScreen>
  );
}
