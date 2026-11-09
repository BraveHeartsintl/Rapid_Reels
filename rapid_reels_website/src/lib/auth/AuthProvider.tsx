"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut as fbSignOut,
  type ConfirmationResult,
  type User,
} from "firebase/auth";
import { getAuthInstance, isFirebaseConfigured } from "@/lib/firebase";
import { getUser, updateUserProfile } from "@/lib/data/queries";
import type { UserDoc, UserType, WithId } from "@/lib/data/types";

interface AuthContextValue {
  user: User | null;
  profile: WithId<UserDoc> | null;
  role: UserType | null;
  /** True until the first auth + profile resolution completes. */
  loading: boolean;
  configured: boolean;
  refreshProfile: () => Promise<WithId<UserDoc> | null>;
  signOut: () => Promise<void>;
  sendOtp: (phoneE164: string) => Promise<void>;
  confirmOtp: (code: string) => Promise<{ user: User; profile: WithId<UserDoc> | null }>;
  hasPendingOtp: () => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

let confirmation: ConfirmationResult | null = null;
let verifier: RecaptchaVerifier | null = null;

function resetVerifier() {
  try {
    verifier?.clear();
  } catch {
    /* ignore */
  }
  verifier = null;
}

/** Normalises user input into E.164 (defaults to +44 when no country code is typed). */
export function toE164(raw: string, defaultCountry = "+44"): string {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  return `${defaultCountry}${digits.replace(/^0+/, "")}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<WithId<UserDoc> | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  const loadProfile = useCallback(async (uid: string) => {
    try {
      const p = await getUser(uid);
      setProfile(p);
      return p;
    } catch {
      setProfile(null);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsub = onAuthStateChanged(getAuthInstance(), async (u) => {
      setUser(u);
      if (u) {
        await loadProfile(u.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    const u = getAuthInstance().currentUser;
    if (!u) {
      setProfile(null);
      return null;
    }
    return loadProfile(u.uid);
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    confirmation = null;
    resetVerifier();
    await fbSignOut(getAuthInstance());
  }, []);

  const sendOtp = useCallback(async (phoneE164: string) => {
    const auth = getAuthInstance();
    resetVerifier();
    verifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
    try {
      confirmation = await signInWithPhoneNumber(auth, phoneE164, verifier);
    } catch (e) {
      resetVerifier();
      throw e;
    }
  }, []);

  const confirmOtp = useCallback(
    async (code: string) => {
      if (!confirmation) throw new Error("Your session expired. Please request a new OTP.");
      const cred = await confirmation.confirm(code);
      confirmation = null;
      const p = await loadProfile(cred.user.uid);
      if (p) {
        void updateUserProfile(cred.user.uid, { lastLoginAt: new Date() }).catch(() => undefined);
      }
      return { user: cred.user, profile: p };
    },
    [loadProfile],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      role: profile?.userType ?? null,
      loading,
      configured: isFirebaseConfigured,
      refreshProfile,
      signOut,
      sendOtp,
      confirmOtp,
      hasPendingOtp: () => confirmation !== null,
    }),
    [user, profile, loading, refreshProfile, signOut, sendOtp, confirmOtp],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <div id="recaptcha-container" />
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/** Where a signed-in user should land after login. */
export function homeForRole(role: UserType | null | undefined): string {
  if (role === "provider") return "/provider-dashboard";
  if (role === "admin" || role === "superadmin") return "/admin-dashboard";
  return "/home";
}
