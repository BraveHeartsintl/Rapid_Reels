"use client";

import { useRouter } from "next/navigation";
import { AsyncView } from "@/components/ui/State";
import { useAuth } from "@/lib/auth/AuthProvider";
import { listProviders, updateUserProfile } from "@/lib/data/queries";
import { saveDraft } from "@/lib/booking/draft";
import { useAsync } from "@/lib/hooks";

export default function CitySelectionPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const state = useAsync(async () => {
    const providers = await listProviders();
    const cities = new Set<string>();
    providers.forEach((p) => {
      const c = p.location?.city?.trim();
      if (c) cities.add(c);
    });
    return [...cities].sort();
  }, []);

  async function choose(city: string) {
    saveDraft({ city });
    if (user && profile) {
      await updateUserProfile(user.uid, { "currentLocation.city": city }).catch(() => undefined);
    }
    router.push(user ? "/home" : "/event-type-selection");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-10">
      <h1 className="text-3xl font-semibold text-white">Select your city</h1>
      <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">We show providers and venues near you.</p>
      <div className="mt-8">
        <AsyncView state={state} empty="No providers are available yet. Check back soon.">
          {(cities) => (
            <div className="grid grid-cols-2 gap-3">
              {cities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => choose(city)}
                  className="rounded-2xl border border-[var(--rr-outline)]/60 bg-[var(--rr-card)] px-4 py-5 text-center font-medium text-white transition hover:border-[var(--rr-primary)]"
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </AsyncView>
      </div>
    </div>
  );
}
