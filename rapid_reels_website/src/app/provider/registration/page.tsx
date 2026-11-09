"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Notice } from "@/components/ui/State";
import { useAuth } from "@/lib/auth/AuthProvider";
import { createProviderProfile, createUserProfile } from "@/lib/data/queries";
import { errorMessage, generateReferralCode } from "@/lib/format";

export default function ProviderRegistrationPage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading || busy) return;
    if (!user) router.replace("/provider/login");
    else if (profile?.userType === "provider") router.replace("/provider-dashboard");
  }, [loading, user, profile, busy, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setBusy(true);
    try {
      const phoneNumber = user.phoneNumber ?? "";
      if (!profile) {
        await createUserProfile(user.uid, {
          phoneNumber,
          email: email.trim(),
          fullName: ownerName.trim(),
          userType: "provider",
          currentLocation: { city: city.trim(), state: "", country: "" },
          referralCode: generateReferralCode(ownerName),
          metadata: { createdFrom: "web" },
        });
      }
      await createProviderProfile(user.uid, {
        businessName: businessName.trim(),
        ownerName: ownerName.trim(),
        email: email.trim(),
        phoneNumber,
        location: { address: "", city: city.trim(), state: "", pincode: "", coordinates: { latitude: 0, longitude: 0 } },
      });
      await refreshProfile();
      router.replace("/provider-business-profile");
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  const blockedCustomer = profile && profile.userType !== "provider";

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-10">
      <h1 className="text-3xl font-semibold text-white">Provider registration</h1>
      <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">
        Start onboarding your studio. Your account is reviewed before you appear to customers.
      </p>
      {blockedCustomer ? (
        <div className="mt-8">
          <Notice>This phone number already belongs to a customer account. Sign in with another number to register as a provider.</Notice>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-4">
          <Input label="Business name" placeholder="Lens & Light Studio" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
          <Input label="Owner name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
          <Input label="Phone" type="tel" value={user?.phoneNumber ?? ""} readOnly />
          {error ? <Notice>{error}</Notice> : null}
          <Button type="submit" className="w-full" disabled={busy || !user}>
            {busy ? "Creating…" : "Continue onboarding"}
          </Button>
        </form>
      )}
    </div>
  );
}
