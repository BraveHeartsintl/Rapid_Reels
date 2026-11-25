"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  customerGroups,
  customerMobile,
  DashboardShell,
  providerGroups,
  providerMobile,
} from "@/components/layout/DashboardShell";

const providerRoots = ["/provider-", "/live-event-mode", "/upload-footage", "/reel-editor"];

/** `/provider-*` pages that belong to the customer booking flow, not the provider app. */
const customerBookingRoots = [
  "/provider-selection",
  "/provider-details",
  "/provider-portfolio",
  "/provider-package-pick",
];

function matchesRoot(pathname: string, root: string) {
  return pathname === root || pathname.startsWith(`${root}/`);
}

function isProviderApp(pathname: string) {
  if (pathname.startsWith("/provider/login") || pathname.startsWith("/provider/registration")) return false;
  // Order matters: `/provider-portfolio` is customer-facing, `/provider-portfolio-upload` is not.
  if (customerBookingRoots.some((root) => matchesRoot(pathname, root))) return false;
  return providerRoots.some((root) => pathname.startsWith(root));
}

export function FlowScreen({
  title,
  subtitle,
  children,
  backHref,
  nextHref,
  nextLabel = "Continue",
  width = "wide",
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  backHref?: string;
  nextHref?: string;
  nextLabel?: string;
  width?: "wide" | "form";
}) {
  const pathname = usePathname();
  const provider = isProviderApp(pathname);

  return (
    <DashboardShell
      brand={provider ? "Provider" : "Customer"}
      groups={provider ? providerGroups : customerGroups}
      mobileTabs={provider ? providerMobile : customerMobile}
      backHref={backHref}
      action={
        provider ? undefined : (
          <Link
            href="/event-type-selection"
            className="block rounded-full bg-[var(--color-primary)] px-3 py-2.5 text-center text-sm font-semibold text-white"
          >
            Book event
          </Link>
        )
      }
    >
      <div className={width === "form" ? "max-w-3xl" : undefined}>
        <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-2xl text-base text-[var(--rr-text-secondary)]">{subtitle}</p> : null}
        <div className="mt-8">{children}</div>
        {nextHref ? (
          <div className="mt-8 max-w-xs">
            <Button href={nextHref} className="w-full">
              {nextLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </DashboardShell>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
        {subtitle ? <p className="mt-2 text-base text-[var(--rr-text-secondary)]">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
