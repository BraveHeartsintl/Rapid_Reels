"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Notice } from "@/components/ui/State";
import { useAuth } from "@/lib/auth/AuthProvider";
import { createUserProfile } from "@/lib/data/queries";
import { safeFileName, uploadFile } from "@/lib/data/storage";
import { errorMessage, generateReferralCode } from "@/lib/format";
import { useQuery } from "@/lib/hooks";

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();
  const query = useQuery();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [marketing, setMarketing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (profile && !busy) router.replace("/home");
  }, [loading, user, profile, busy, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setBusy(true);
    try {
      let profileImage: string | null = null;
      if (photo) {
        const up = await uploadFile(`user_profile_pics/${user.uid}/${safeFileName(photo.name)}`, photo);
        profileImage = up.url;
      }
      await createUserProfile(user.uid, {
        phoneNumber: user.phoneNumber ?? "",
        email: email.trim(),
        fullName: fullName.trim(),
        profileImage,
        userType: "customer",
        currentLocation: { city: "Unknown", state: "Unknown", country: "Unknown" },
        referralCode: generateReferralCode(fullName),
        metadata: {
          clientProfileCompleted: true,
          gender,
          marketingConsent: marketing,
          termsPrivacyAupAcceptedAt: new Date().toISOString(),
          createdFrom: "web",
        },
      });
      await refreshProfile();
      const next = query.get("next");
      router.replace(next && next.startsWith("/") ? next : "/city-selection");
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-10">
      <h1 className="text-3xl font-semibold text-white">Profile setup</h1>
      <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">Complete your profile once.</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <Input label="Full name" placeholder="Aisha Khan" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="flex w-full flex-col gap-1.5 text-sm">
          <span className="text-[var(--rr-text-secondary)]">Gender</span>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            className="w-full rounded-2xl border border-[var(--rr-outline)] bg-[var(--rr-surface)] px-4 py-3 text-[var(--rr-text)] outline-none transition focus:border-[var(--rr-primary)] focus:ring-2 focus:ring-[var(--rr-primary)]/30"
          >
            <option value="" disabled>
              Select gender
            </option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </label>
        <label className="block rounded-2xl border border-dashed border-[var(--rr-outline)] bg-[var(--rr-surface)] p-6 text-center text-sm text-[var(--rr-text-tertiary)]">
          {photo ? photo.name : "Add a profile photo (optional)"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--rr-text-secondary)]">
          <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="accent-[var(--rr-primary)]" />
          Send me offers and updates
        </label>
        <p className="text-xs text-[var(--rr-text-tertiary)]">
          By continuing you accept our <a href="/legal/terms" className="underline">Terms</a> and <a href="/legal/privacy" className="underline">Privacy Policy</a>.
        </p>
        {error ? <Notice>{error}</Notice> : null}
        <Button type="submit" className="w-full" disabled={busy || !fullName.trim() || !gender || !user}>
          {busy ? "Saving…" : "Continue"}
        </Button>
      </form>
    </div>
  );
}
