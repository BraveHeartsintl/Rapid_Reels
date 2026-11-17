"use client";

import { AuthShell } from "@/components/auth/AuthShell";
import { PhoneLogin } from "@/components/auth/PhoneLogin";

export default function LoginPage() {
  return (
    <AuthShell
      role="customer"
      title="Welcome back"
      subtitle="Enter your phone number and we will text you a one-time code."
    >
      <PhoneLogin role="customer" />
    </AuthShell>
  );
}
