"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ProfileSetupPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-10">
      <h1 className="text-3xl font-semibold text-white">Profile setup</h1>
      <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">Complete your profile once.</p>
      <div className="mt-8 space-y-4">
        <Input label="Full name" placeholder="Aisha Khan" defaultValue="Aisha Khan" />
        <Input label="Email" type="email" placeholder="you@example.com" defaultValue="aisha@example.com" />
        <Input label="Gender" placeholder="Optional" />
        <div className="rounded-2xl border border-dashed border-[var(--rr-outline)] bg-[var(--rr-surface)] p-8 text-center text-sm text-[var(--rr-text-tertiary)]">
          Profile photo upload (static placeholder)
        </div>
        <Button href="/city-selection" className="w-full">
          Continue
        </Button>
      </div>
    </div>
  );
}
