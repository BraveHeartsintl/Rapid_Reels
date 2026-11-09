"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { cn } from "@/lib/utils";

export function SignOutButton({ className, label = "Sign out" }: { className?: string; label?: string }) {
  const router = useRouter();
  const { signOut } = useAuth();
  return (
    <button
      type="button"
      className={cn("text-sm text-[var(--rr-error)]", className)}
      onClick={async () => {
        await signOut();
        router.replace("/");
      }}
    >
      {label}
    </button>
  );
}
