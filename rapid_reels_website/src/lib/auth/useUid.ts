"use client";

import { useAuth } from "@/lib/auth/AuthProvider";

/** Signed-in uid (or null while loading / signed out). Use as `enabled` for useAsync. */
export function useUid(): string | null {
  return useAuth().user?.uid ?? null;
}
