"use client";

import { AuthShell } from "@/components/auth/AuthShell";
import { PhoneLogin } from "@/components/auth/PhoneLogin";

export default function AdminLoginPage() {
  return (
    <AuthShell
      role="admin"
      title="Admin login"
      subtitle="Admin access is limited to approved phone numbers."
    >
      <PhoneLogin role="admin" />
    </AuthShell>
  );
}
