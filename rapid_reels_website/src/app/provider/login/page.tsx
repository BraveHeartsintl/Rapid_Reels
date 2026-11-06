"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ProviderLoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
      <h1 className="text-3xl font-semibold text-white">Provider login</h1>
      <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">Static demo — no real authentication.</p>
      <div className="mt-8 space-y-4">
        <Input label="Email" type="email" placeholder="studio@example.com" />
        <Input label="Password" type="password" placeholder="••••••••" />
        <Button href="/provider-portal/demo/home" className="w-full">
          Sign in
        </Button>
        <Button href="/provider/registration" variant="ghost" className="w-full">
          Create provider account
        </Button>
      </div>
    </div>
  );
}
