"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Notice } from "@/components/ui/State";
import { useAuth } from "@/lib/auth/AuthProvider";
import { resolvePostLogin, type LoginRole } from "@/lib/auth/postLogin";
import { errorMessage } from "@/lib/format";
import { useQuery } from "@/lib/hooks";

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.300-8l-6.5 5C9.5 39.6 16.200 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.200 4.200-4.100 5.600l6.200 5.200C37 39.200 44 34 44 24c0-1.300-.1-2.600-.4-3.900z" />
    </svg>
  );
}

const GOOGLE_ERRORS: Record<string, string> = {
  "auth/popup-closed-by-user": "",
  "auth/cancelled-popup-request": "",
  "auth/popup-blocked": "Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.",
  "auth/operation-not-allowed":
    "Google sign-in is not enabled yet. Enable it under Firebase Authentication → Sign-in method → Google.",
  "auth/account-exists-with-different-credential":
    "An account already exists with this email using a different sign-in method.",
};

/** "Continue with Google" for the customer and provider sign-in pages. */
export function GoogleSignInButton({ role, disabled }: { role: LoginRole; disabled?: boolean }) {
  const router = useRouter();
  const { signInWithGoogle, signOut } = useAuth();
  const query = useQuery();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    setBusy(true);
    try {
      const { profile } = await signInWithGoogle();
      const result = resolvePostLogin(role, profile, query.get("next"));
      if (result.kind === "redirect") return router.replace(result.to);
      await signOut();
      setError(result.message);
    } catch (err) {
      const code = (err as { code?: string } | null)?.code;
      if (code && code in GOOGLE_ERRORS) {
        if (GOOGLE_ERRORS[code]) setError(GOOGLE_ERRORS[code]);
      } else {
        setError(errorMessage(err));
      }
    }
    setBusy(false);
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || busy}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-white/15 bg-white/5 text-sm font-semibold text-white transition duration-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <GoogleLogo />
        {busy ? "Opening Google…" : role === "provider" ? "Continue with Google" : "Sign in or sign up with Google"}
      </button>
      {error ? <Notice>{error}</Notice> : null}
    </div>
  );
}
