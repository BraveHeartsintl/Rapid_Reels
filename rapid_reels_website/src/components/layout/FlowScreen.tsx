import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function FlowScreen({
  title,
  subtitle,
  children,
  backHref,
  nextHref,
  nextLabel = "Continue",
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  backHref?: string;
  nextHref?: string;
  nextLabel?: string;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-[var(--rr-bg)] px-4 py-6">
      {backHref ? (
        <Link href={backHref} className="mb-4 text-sm text-[var(--rr-text-tertiary)] hover:text-white">
          ← Back
        </Link>
      ) : (
        <div className="mb-4 h-5" />
      )}
      <h1 className="text-2xl font-semibold text-white">{title}</h1>
      {subtitle ? (
        <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">{subtitle}</p>
      ) : null}
      <div className="mt-6 flex-1">{children}</div>
      {nextHref ? (
        <div className="sticky bottom-0 mt-8 bg-gradient-to-t from-[var(--rr-bg)] via-[var(--rr-bg)] to-transparent pt-4 pb-2">
          <Button href={nextHref} className="w-full">
            {nextLabel}
          </Button>
        </div>
      ) : null}
    </div>
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
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-[var(--rr-text-secondary)]">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
