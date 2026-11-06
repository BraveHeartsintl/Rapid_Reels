"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ProviderRegistrationPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-10">
      <h1 className="text-3xl font-semibold text-white">Provider registration</h1>
      <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">Start onboarding your studio.</p>
      <div className="mt-8 space-y-4">
        <Input label="Business name" placeholder="Lens & Light Studio" />
        <Input label="Email" type="email" />
        <Input label="Phone" type="tel" />
        <Input label="Password" type="password" />
        <Button href="/provider-business-profile" className="w-full">
          Continue onboarding
        </Button>
      </div>
    </div>
  );
}
