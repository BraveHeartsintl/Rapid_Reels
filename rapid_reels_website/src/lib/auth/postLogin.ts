import { homeForRole } from "@/lib/auth/AuthProvider";
import type { UserDoc, WithId } from "@/lib/data/types";

export type LoginRole = "customer" | "provider" | "admin";

export type PostLoginResult =
  | { kind: "redirect"; to: string }
  | { kind: "reject"; message: string };

/**
 * Decides where a freshly signed-in user goes, or rejects them if the account
 * type doesn't match the sign-in page they used. Shared by OTP and Google sign-in.
 */
export function resolvePostLogin(
  role: LoginRole,
  profile: WithId<UserDoc> | null,
  next: string | null,
): PostLoginResult {
  const safeNext = next && next.startsWith("/") ? next : null;
  const type = profile?.userType;

  if (role === "admin") {
    if (type === "admin" || type === "superadmin") return { kind: "redirect", to: safeNext ?? "/admin-dashboard" };
    return { kind: "reject", message: "This account does not have admin access." };
  }

  if (role === "provider") {
    if (!profile) return { kind: "redirect", to: "/provider/registration" };
    if (type === "provider") return { kind: "redirect", to: safeNext ?? "/provider-dashboard" };
    return { kind: "reject", message: "This account is registered as a customer. Use customer sign-in instead." };
  }

  if (!profile) {
    return { kind: "redirect", to: `/profile-setup${safeNext ? `?next=${encodeURIComponent(safeNext)}` : ""}` };
  }
  return { kind: "redirect", to: safeNext ?? homeForRole(type) };
}
