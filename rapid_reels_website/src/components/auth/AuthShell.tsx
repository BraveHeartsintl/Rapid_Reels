import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type AuthRole = "customer" | "provider" | "admin";

const roles: { id: AuthRole; label: string; href: string }[] = [
  { id: "customer", label: "Customer", href: "/login" },
  { id: "provider", label: "Provider", href: "/provider/login" },
  { id: "admin", label: "Admin", href: "/admin/login" },
];

const panels: Record<AuthRole, { headline: string; accent: string; points: string[] }> = {
  customer: {
    headline: "Your moments, captured and delivered",
    accent: "fast.",
    points: [
      "Book verified creators in your city",
      "Follow your event live as it happens",
      "Receive social-ready reels in minutes",
    ],
  },
  provider: {
    headline: "Grow your studio with every",
    accent: "celebration.",
    points: [
      "Receive bookings from customers",
      "Manage your calendar and catalogue",
      "Track your earnings in one place",
    ],
  },
  admin: {
    headline: "Run the platform with",
    accent: "confidence.",
    points: [
      "Verify providers and approve reels",
      "Oversee bookings and payments",
      "Moderate content and reviews",
    ],
  },
};

function Check() {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-[var(--rr-secondary)]">
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

/**
 * Split-screen layout shared by the customer, provider and admin sign-in pages
 * and the OTP step: brand panel on the left (large screens), form card on the right.
 */
export function AuthShell({
  role,
  title,
  subtitle,
  showRoleTabs = true,
  children,
}: {
  role: AuthRole;
  title: string;
  subtitle: string;
  showRoleTabs?: boolean;
  children: React.ReactNode;
}) {
  const panel = panels[role];

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden lg:block">
        <Image
          src="/hero-event.jpg"
          alt=""
          fill
          sizes="55vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] via-[var(--color-ink)]/70 to-[var(--color-ink)]/30" />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_0%_100%,rgba(124,58,237,0.35),transparent_70%)]"
          aria-hidden="true"
        />

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <Link href="/" className="inline-flex w-fit">
            <Image
              src="/logo.png"
              alt="Rapid Reels"
              width={140}
              height={78}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>

          <div className="max-w-lg">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-primary)]" />
              Rapid Reels
            </span>
            <h2 className="mt-6 text-4xl font-bold leading-[1.1] text-white xl:text-5xl">
              {panel.headline} <span className="text-gradient">{panel.accent}</span>
            </h2>
            <ul className="mt-8 space-y-4">
              {panel.points.map((p) => (
                <li key={p} className="flex items-center gap-3 text-base text-[var(--rr-text-secondary)]">
                  <Check />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <main className="relative flex flex-col bg-[var(--color-ink)] px-5 py-6 sm:px-10">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_0%,rgba(124,58,237,0.14),transparent_70%)]"
          aria-hidden="true"
        />

        <div className="relative flex items-center justify-between">
          <Link href="/" className="lg:invisible">
            <Image
              src="/logo.png"
              alt="Rapid Reels"
              width={120}
              height={67}
              className="h-10 w-auto object-contain"
            />
          </Link>
          <Link
            href="/"
            className="rounded-full px-3 py-1.5 text-sm text-[var(--rr-text-tertiary)] transition duration-200 hover:bg-white/10 hover:text-white"
          >
            ← Back to home
          </Link>
        </div>

        <div className="relative flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md animate-fade-up">
            {showRoleTabs ? (
              <nav
                aria-label="Account type"
                className="mb-6 flex rounded-full border border-white/10 bg-white/5 p-1"
              >
                {roles.map((r) => {
                  const active = r.id === role;
                  return (
                    <Link
                      key={r.id}
                      href={r.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex-1 rounded-full px-3 py-2 text-center text-sm font-semibold transition duration-200 ease-out",
                        active
                          ? "bg-[var(--color-primary)] text-white shadow-[var(--shadow-glow)]"
                          : "text-[var(--rr-text-secondary)] hover:text-white",
                      )}
                    >
                      {r.label}
                    </Link>
                  );
                })}
              </nav>
            ) : null}

            <div className="rounded-[var(--radius-lg)] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-7 shadow-[var(--shadow-raised)] backdrop-blur sm:p-9">
              <h1 className="text-3xl font-bold text-white sm:text-4xl">{title}</h1>
              <p className="mt-3 text-sm leading-relaxed text-[var(--rr-text-secondary)]">{subtitle}</p>
              {children}
            </div>

            <p className="mt-6 text-center text-xs text-[var(--rr-text-tertiary)]">
              By continuing you agree to our{" "}
              <Link href="/legal/terms" className="underline-offset-4 hover:text-white hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/legal/privacy" className="underline-offset-4 hover:text-white hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
