"use client";

import { PhoneLogin } from "@/components/auth/PhoneLogin";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
      <h1 className="text-3xl font-semibold text-white">Admin login</h1>
      <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">
        Admin access is limited to approved phone numbers.
      </p>
      <PhoneLogin role="admin" />
    </div>
  );
}
