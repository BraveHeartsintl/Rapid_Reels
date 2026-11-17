"use client";

import { AuthShell } from "@/components/auth/AuthShell";
import { PhoneLogin } from "@/components/auth/PhoneLogin";

export default function ProviderLoginPage() {
  return (
    <AuthShell
      role="provider"
      title="Provider login"
      subtitle="Sign in with the phone number registered to your studio."
    >
      <PhoneLogin role="provider" />
    </AuthShell>
  );
}
