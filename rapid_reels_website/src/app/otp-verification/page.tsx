"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function OtpPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
      <h1 className="text-3xl font-semibold text-white">Enter OTP</h1>
      <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">
        Any 6 digits work in this static demo.
      </p>
      <div className="mt-8 space-y-4">
        <Input label="OTP" placeholder="••••••" maxLength={6} inputMode="numeric" />
        <Button href="/profile-setup" className="w-full">
          Verify
        </Button>
        <Button href="/login" variant="ghost" className="w-full">
          Change number
        </Button>
      </div>
    </div>
  );
}
