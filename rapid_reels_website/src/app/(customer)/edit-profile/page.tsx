"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Notice } from "@/components/ui/State";
import { useAuth } from "@/lib/auth/AuthProvider";
import { updateUserProfile } from "@/lib/data/queries";
import { safeFileName, uploadFile } from "@/lib/data/storage";
import { errorMessage } from "@/lib/format";

export default function Page() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      const patch: Record<string, unknown> = {
        fullName: (name ?? profile?.fullName ?? "").trim(),
        email: (email ?? profile?.email ?? "").trim(),
      };
      if (photo) {
        const up = await uploadFile(`user_profile_pics/${user.uid}/${safeFileName(photo.name)}`, photo);
        patch.profileImage = up.url;
      }
      await updateUserProfile(user.uid, patch);
      await refreshProfile();
      router.push("/profile");
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Edit profile" />
      <form onSubmit={save} className="space-y-4">
        <Input label="Full name" value={name ?? profile?.fullName ?? ""} onChange={(e) => setName(e.target.value)} required />
        <Input label="Email" type="email" value={email ?? profile?.email ?? ""} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Phone" value={profile?.phoneNumber ?? user?.phoneNumber ?? ""} readOnly />
        <label className="block rounded-2xl border border-dashed border-[var(--rr-outline)] bg-[var(--rr-surface)] p-5 text-center text-sm text-[var(--rr-text-tertiary)]">
          {photo ? photo.name : "Change profile photo"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
        </label>
        {error ? <Notice>{error}</Notice> : null}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </Button>
      </form>
    </div>
  );
}
