"use client";

import { Button } from "@/components/ui/Button";
import { homeForRole, useAuth } from "@/lib/auth/AuthProvider";

/** Marketing-nav buttons: sign-in links for guests, a dashboard link once signed in. */
export function NavAuthActions() {
  const { user, profile, loading } = useAuth();

  if (user && profile) {
    return (
      <Button href={homeForRole(profile.userType)} className="px-4 py-2 text-xs sm:text-sm">
        Open dashboard
      </Button>
    );
  }

  // Avoid flashing "Sign in" to a signed-in user while auth is resolving.
  if (loading) return <div className="h-9 w-28" aria-hidden />;

  return (
    <>
      <Button href="/login" variant="ghost" className="hidden px-4 py-2 sm:inline-flex">
        Sign in
      </Button>
      <Button href="/role-selection" className="px-4 py-2 text-xs sm:text-sm">
        Get started
      </Button>
    </>
  );
}
