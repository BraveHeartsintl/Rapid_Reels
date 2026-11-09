"use client";

import { Button } from "@/components/ui/Button";
import { PhoneLogin } from "@/components/auth/PhoneLogin";

export default function ProviderLoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
      <h1 className="text-3xl font-semibold text-white">Provider login</h1>
      <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">
        Sign in with the phone number registered to your studio.
      </p>
      <PhoneLogin role="provider">
        <Button href="/login" variant="ghost" className="w-full">
          I am a customer
        </Button>
      </PhoneLogin>
    </div>
  );
}
