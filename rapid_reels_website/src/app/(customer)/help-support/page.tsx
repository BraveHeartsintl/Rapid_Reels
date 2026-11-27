"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Notice } from "@/components/ui/State";
import { useUid } from "@/lib/auth/useUid";
import { createSupportTicket } from "@/lib/data/queries";
import { errorMessage } from "@/lib/format";
import { SUPPORT_WHATSAPP_DISPLAY, SUPPORT_WHATSAPP_URL } from "@/lib/supportContact";

export default function Page() {
  const router = useRouter();
  const uid = useUid();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) return;
    setBusy(true);
    setError(null);
    try {
      await createSupportTicket(uid, { subject: subject.trim(), description: message.trim() });
      router.push("/my-tickets");
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Help & support" subtitle="Tell us what went wrong and we will get back to you." />
      <a
        href={SUPPORT_WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-6 inline-flex w-full items-center justify-center rounded-2xl border border-[var(--rr-primary)] px-6 py-3 text-sm font-semibold text-[var(--rr-primary)]"
      >
        WhatsApp {SUPPORT_WHATSAPP_DISPLAY}
      </a>
      <form onSubmit={submit} className="space-y-4">
        <Input label="Subject" placeholder="Booking issue" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-[var(--rr-text-secondary)]">Message</span>
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-28 rounded-2xl border border-[var(--rr-outline)] bg-[var(--rr-surface)] px-4 py-3 text-white outline-none focus:border-[var(--rr-primary)]"
          />
        </label>
        {error ? <Notice>{error}</Notice> : null}
        <Button type="submit" className="w-full" disabled={busy || !subject.trim() || !message.trim()}>
          {busy ? "Submitting…" : "Submit ticket"}
        </Button>
      </form>
    </div>
  );
}
