"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { RouteGuard } from "@/components/RouteGuard";

/** Client-side Firebase bootstrap: auth state + route protection. */
export function FirebaseProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <RouteGuard>{children}</RouteGuard>
    </AuthProvider>
  );
}
