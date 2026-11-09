"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Notice } from "@/components/ui/State";
import { homeForRole, toE164, useAuth } from "@/lib/auth/AuthProvider";
import { errorMessage } from "@/lib/format";
import { useQuery } from "@/lib/hooks";

export default function OtpPage() {
  const router = useRouter();
  const { confirmOtp, sendOtp, signOut, hasPendingOtp } = useAuth();
  const query = useQuery();
  const role = query.get("role") ?? "customer";
  const phone = query.get("phone");
  const next = query.get("next");
  const loginPath = role === "provider" ? "/provider/login" : role === "admin" ? "/admin/login" : "/login";

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!hasPendingOtp()) {
      setError("Your session expired. Please request a new code.");
      return;
    }
    setBusy(true);
    try {
      const { profile } = await confirmOtp(code.trim());
      const safeNext = next && next.startsWith("/") ? next : null;
      const type = profile?.userType;

      if (role === "admin") {
        if (type === "admin" || type === "superadmin") return router.replace(safeNext ?? "/admin-dashboard");
        await signOut();
        setError("This phone number does not have admin access.");
      } else if (role === "provider") {
        if (!profile) return router.replace("/provider/registration");
        if (type === "provider") return router.replace(safeNext ?? "/provider-dashboard");
        await signOut();
        setError("This number is registered as a customer. Use customer sign-in instead.");
      } else {
        if (!profile) return router.replace(`/profile-setup${safeNext ? `?next=${encodeURIComponent(safeNext)}` : ""}`);
        return router.replace(safeNext ?? homeForRole(type));
      }
      setBusy(false);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  async function resend() {
    if (!phone) return router.replace(loginPath);
    setError(null);
    try {
      await sendOtp(toE164(phone));
      setInfo("A new code has been sent.");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
      <h1 className="text-3xl font-semibold text-white">Enter OTP</h1>
      <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">
        {phone ? `We sent a 6-digit code to ${phone}.` : "Enter the 6-digit code we sent you."}
      </p>
      <form onSubmit={verify} className="mt-8 space-y-4">
        <Input
          label="OTP"
          placeholder="••••••"
          maxLength={6}
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          required
        />
        {error ? <Notice>{error}</Notice> : null}
        {info ? <Notice tone="success">{info}</Notice> : null}
        <Button type="submit" className="w-full" disabled={busy || code.length !== 6}>
          {busy ? "Verifying…" : "Verify"}
        </Button>
        <Button type="button" variant="outline" className="w-full" onClick={resend}>
          Resend code
        </Button>
        <Button href={loginPath} variant="ghost" className="w-full">
          Change number
        </Button>
      </form>
    </div>
  );
}
