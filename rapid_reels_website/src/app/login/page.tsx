"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
      <h1 className="text-3xl font-semibold text-white">Sign in</h1>
      <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">
        Phone OTP, Google, or Apple — static demo advances without real auth.
      </p>
      <div className="mt-8 space-y-4">
        <Input label="Phone number" placeholder="+91 XXXXX XXXXX" type="tel" />
        <Button href="/otp-verification" className="w-full">
          Send OTP
        </Button>
        <div className="relative py-2 text-center text-xs text-[var(--rr-text-tertiary)]">
          or continue with
        </div>
        <Button href="/profile-setup" variant="outline" className="w-full">
          Continue with Google
        </Button>
        <Button href="/profile-setup" variant="ghost" className="w-full">
          Continue with Apple
        </Button>
      </div>
    </div>
  );
}
