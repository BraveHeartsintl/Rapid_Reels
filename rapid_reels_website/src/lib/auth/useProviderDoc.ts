"use client";

import { useAuth } from "@/lib/auth/AuthProvider";
import { getProvider } from "@/lib/data/queries";
import type { ProviderDoc, WithId } from "@/lib/data/types";
import { useAsync } from "@/lib/hooks";

/** Loads `providers/{uid}` for the signed-in provider (errors if the profile does not exist). */
export function useProviderDoc() {
  const uid = useAuth().user?.uid ?? null;
  const state = useAsync<WithId<ProviderDoc>>(
    async () => {
      const p = await getProvider(uid!);
      if (!p) throw new Error("Provider profile not found. Complete registration first.");
      return p;
    },
    [uid],
    Boolean(uid),
  );
  return { uid, ...state };
}
