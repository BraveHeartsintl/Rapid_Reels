"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Notice } from "@/components/ui/State";
import { toE164, useAuth } from "@/lib/auth/AuthProvider";
import { errorMessage } from "@/lib/format";
import { useQuery } from "@/lib/hooks";

export type LoginRole = "customer" | "provider" | "admin";

/** Phone number entry shared by the customer, provider and admin login pages. */
export function PhoneLogin({ role, children }: { role: LoginRole; children?: React.ReactNode }) {
  const router = useRouter();
  const { sendOtp, configured } = useAuth();
  const query = useQuery();
  const [country, setCountry] = useState("+44");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const e164 = toE164(phone, country);
    if (!/^\+\d{8,15}$/.test(e164)) {
      setError("Enter a valid phone number including country code, e.g. 7700 900123.");
      return;
    }
    setBusy(true);
    try {
      await sendOtp(e164);
      const params = new URLSearchParams({ role, phone: e164 });
      const next = query.get("next");
      if (next) params.set("next", next);
      router.push(`/otp-verification?${params.toString()}`);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      {!configured ? <Notice>Firebase is not configured. Add your keys to .env.local.</Notice> : null}
      <div className="flex items-end gap-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-[var(--rr-text-secondary)]">Country</span>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="rounded-2xl border border-[var(--rr-outline)] bg-[var(--rr-surface)] px-3 py-3 text-[var(--rr-text)] outline-none focus:border-[var(--rr-primary)]"
          >
            <option value="+44">UK +44</option>
            <option value="+91">India +91</option>
          </select>
        </label>
        <Input
          label="Phone number"
          placeholder={country === "+91" ? "98765 43210" : "7XXX XXXXXX"}
          type="tel"
          autoComplete="tel-national"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>
      {error ? <Notice>{error}</Notice> : null}
      <Button type="submit" className="w-full" disabled={busy || !configured}>
        {busy ? "Sending…" : "Send OTP"}
      </Button>
      {children}
    </form>
  );
}
