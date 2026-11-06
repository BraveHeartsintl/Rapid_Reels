"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
      <h1 className="text-3xl font-semibold text-white">Admin login</h1>
      <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">Email/password gate — static demo.</p>
      <div className="mt-8 space-y-4">
        <Input label="Email" type="email" placeholder="admin@rapidreels.app" />
        <Input label="Password" type="password" />
        <Button href="/admin-dashboard" className="w-full">
          Enter console
        </Button>
      </div>
    </div>
  );
}
