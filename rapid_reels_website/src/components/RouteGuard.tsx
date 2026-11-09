"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";

type Access = "public" | "customer" | "provider" | "admin";

/** Pages anyone can open (marketing, legal, auth, and the browse part of the booking flow). */
const PUBLIC_PREFIXES = [
  "/legal",
  "/for-customers",
  "/for-providers",
  "/how-it-works",
  "/contact",
  "/download",
  "/cookie-preferences",
  "/terms-privacy",
  "/refund-cancellation-policy",
  "/legal-documents",
  "/packages",
  "/unauthorized",
  "/login",
  "/otp-verification",
  "/profile-setup",
  "/role-selection",
  "/onboarding",
  "/provider/login",
  "/provider/registration",
  "/admin/login",
  "/city-selection",
  "/event-type-selection",
  "/provider-selection",
  "/provider-details",
  "/provider-portfolio",
  "/catalogue-selection",
  "/provider-package-pick",
  "/package-selection",
  "/package-customization",
  "/event-details-form",
  "/venue-selection",
];

function matches(path: string, prefix: string) {
  return path === prefix || path.startsWith(`${prefix}/`);
}

export function accessFor(path: string): Access {
  if (path === "/") return "public";
  // Order matters: `/provider-portfolio` is public, `/provider-portfolio-upload` is not.
  if (PUBLIC_PREFIXES.some((p) => matches(path, p))) return "public";
  if (path.startsWith("/admin-")) return "admin";
  if (
    path.startsWith("/provider-") ||
    path.startsWith("/provider-portal") ||
    path === "/live-event-mode" ||
    path === "/upload-footage" ||
    path === "/reel-editor"
  ) {
    return "provider";
  }
  return "customer";
}

function loginFor(access: Access): string {
  if (access === "provider") return "/provider/login";
  if (access === "admin") return "/admin/login";
  return "/login";
}

export function RouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, role, loading, configured } = useAuth();
  const access = accessFor(pathname);

  let decision: "allow" | "wait" | { redirect: string } = "allow";
  if (access !== "public" && configured) {
    if (loading) {
      decision = "wait";
    } else if (!user) {
      decision = { redirect: `${loginFor(access)}?next=${encodeURIComponent(pathname)}` };
    } else if (!profile) {
      decision = {
        redirect: access === "provider" ? "/provider/registration" : "/profile-setup",
      };
    } else if (access === "admin" && role !== "admin" && role !== "superadmin") {
      decision = { redirect: "/unauthorized" };
    } else if (access === "provider" && role !== "provider") {
      decision = { redirect: "/unauthorized" };
    }
  }

  const target = typeof decision === "object" ? decision.redirect : null;
  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  if (decision === "allow") return children;

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-[var(--rr-text-tertiary)]">
      Loading…
    </div>
  );
}
