import { toDate } from "@/lib/data/types";

const SYMBOLS: Record<string, string> = { gbp: "£", inr: "₹", usd: "$", eur: "€" };

export function fmtMoney(amount: number | undefined | null, currency = "gbp"): string {
  const n = Number(amount ?? 0);
  const symbol = SYMBOLS[currency.toLowerCase()] ?? `${currency.toUpperCase()} `;
  return `${symbol}${n.toLocaleString("en-GB", { maximumFractionDigits: 2 })}`;
}

export function fmtDate(v: unknown): string {
  const d = toDate(v);
  if (!d) return "—";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function fmtDateTime(v: unknown): string {
  const d = toDate(v);
  if (!d) return "—";
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Local-calendar yyyy-MM-dd (matches the app's `dateKeyLocal`). */
export function dateKeyLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function titleCase(s: string | undefined | null): string {
  if (!s) return "";
  return s.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function generateReferralCode(name: string): string {
  const base = (name || "RAPID").replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 5) || "RAPID";
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${base}${suffix}`;
}

const AUTH_MESSAGES: Record<string, string> = {
  "auth/invalid-app-credential":
    "Phone verification was rejected (reCAPTCHA / app credential check failed). Refresh the page and try again, use a normal browser on http://localhost, or try a Firebase test phone number.",
  "auth/captcha-check-failed":
    "This website's domain is not authorized in Firebase. Add it under Firebase Authentication → Settings → Authorized domains.",
  "auth/unauthorized-domain":
    "This website's domain is not authorized in Firebase. Add it under Firebase Authentication → Settings → Authorized domains.",
  "auth/operation-not-allowed":
    "SMS to this country is not enabled. Enable it under Firebase Authentication → Settings → SMS region policy.",
  "auth/invalid-phone-number": "That phone number is not valid. Check the country and number.",
  "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
  "auth/invalid-verification-code": "That code is incorrect. Check it and try again.",
  "auth/code-expired": "That code has expired. Request a new one.",
};

export function errorMessage(e: unknown): string {
  const code = (e as { code?: string } | null)?.code;
  if (code && AUTH_MESSAGES[code]) return AUTH_MESSAGES[code];
  if (e instanceof Error) return e.message;
  return typeof e === "string" ? e : "Something went wrong";
}

export const EVENT_TYPES = [
  { id: "wedding", label: "Wedding", color: "#6A00FF" },
  { id: "birthday", label: "Birthday", color: "#3A8AA4" },
  { id: "engagement", label: "Engagement", color: "#4B00C8" },
  { id: "corporate", label: "Corporate", color: "#F3C759" },
  { id: "brand", label: "Brand collab", color: "#DDBA63" },
] as const;
