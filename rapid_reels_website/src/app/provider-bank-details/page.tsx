"use client";

import { useState } from "react";
import { FlowScreen } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AsyncView, Notice } from "@/components/ui/State";
import { useProviderDoc } from "@/lib/auth/useProviderDoc";
import { updateProvider } from "@/lib/data/queries";
import type { ProviderDoc } from "@/lib/data/types";
import { errorMessage } from "@/lib/format";

function BankForm({ uid, provider }: { uid: string; provider: ProviderDoc }) {
  const b = provider.bankDetails ?? {};
  const [holder, setHolder] = useState(b.accountHolderName ?? "");
  const [bank, setBank] = useState(b.bankName ?? "");
  const [account, setAccount] = useState(b.accountNumber ?? "");
  const [sort, setSort] = useState(b.ifscCode ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await updateProvider(uid, {
        bankDetails: {
          ...b,
          accountHolderName: holder.trim(),
          bankName: bank.trim(),
          accountNumber: account.trim(),
          ifscCode: sort.trim(),
          countryCode: b.countryCode ?? "GB",
        },
      });
      setMsg({ tone: "success", text: "Bank details saved." });
    } catch (err) {
      setMsg({ tone: "error", text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <Input label="Account holder name" value={holder} onChange={(e) => setHolder(e.target.value)} required />
      <Input label="Bank name" value={bank} onChange={(e) => setBank(e.target.value)} required />
      <Input label="Account number" inputMode="numeric" value={account} onChange={(e) => setAccount(e.target.value)} required />
      <Input label="Sort code" value={sort} onChange={(e) => setSort(e.target.value)} placeholder="00-00-00" required />
      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
      <Button type="submit" className="w-full" disabled={busy}>{busy ? "Saving…" : "Save bank details"}</Button>
    </form>
  );
}

export default function Page() {
  const state = useProviderDoc();
  return (
    <FlowScreen title="Bank details" subtitle="Where your payouts are sent" backHref="/provider-dashboard">
      <AsyncView state={state} empty="Provider profile not found." isEmpty={(d) => !d}>
        {(p) => <BankForm uid={state.uid!} provider={p} />}
      </AsyncView>
    </FlowScreen>
  );
}
