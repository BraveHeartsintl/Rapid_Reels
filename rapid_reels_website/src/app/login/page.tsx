"use client";

import { Button } from "@/components/ui/Button";
import { PhoneLogin } from "@/components/auth/PhoneLogin";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
      <h1 className="text-3xl font-semibold text-white">Sign in</h1>
      <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">
        Enter your phone number and we will text you a one-time code.
      </p>
      <PhoneLogin role="customer">
        <div className="flex justify-between text-xs">
          <Button href="/provider/login" variant="ghost" className="px-3 py-2 text-xs">
            I am a provider
          </Button>
          <Button href="/admin/login" variant="ghost" className="px-3 py-2 text-xs">
            Admin
          </Button>
        </div>
      </PhoneLogin>
    </div>
  );
}
