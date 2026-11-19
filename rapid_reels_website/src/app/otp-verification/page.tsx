"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Notice } from "@/components/ui/State";
import { toE164, useAuth } from "@/lib/auth/AuthProvider";
import { resolvePostLogin, type LoginRole } from "@/lib/auth/postLogin";
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
      const authRole: LoginRole = role === "provider" || role === "admin" ? role : "customer";
      const result = resolvePostLogin(authRole, profile, next);
      if (result.kind === "redirect") return router.replace(result.to);
      await signOut();
      setError(result.message);
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

  const authRole = role === "provider" || role === "admin" ? role : "customer";

  return (
    // The query string is only readable after hydration; hide until then so
    // the brand panel never flashes the wrong role's copy.
    <div className={query.ready ? undefined : "invisible"}>
      <AuthShell
        role={authRole}
        showRoleTabs={false}
        title="Enter OTP"
        subtitle={phone ? `We sent a 6-digit code to ${phone}.` : "Enter the 6-digit code we sent you."}
      >
        <form onSubmit={verify} className="mt-8 space-y-5">
          <Input
            label="OTP"
            className="h-14! text-center text-2xl font-semibold tracking-[0.5em]"
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
      </AuthShell>
    </div>
  );
}
