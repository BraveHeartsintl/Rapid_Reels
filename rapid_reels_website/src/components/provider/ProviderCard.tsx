/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Badge } from "@/components/ui/Card";
import { fmtMoney } from "@/lib/format";
import type { ProviderDoc, WithId } from "@/lib/data/types";

export function providerStartingPrice(p: ProviderDoc): number | null {
  const prices = (p.packages ?? []).map((x) => x.price).filter((n) => typeof n === "number" && n > 0);
  return prices.length ? Math.min(...prices) : null;
}

export function providerName(p: ProviderDoc): string {
  return p.businessName || p.ownerName || "Provider";
}

export function ProviderCard({ provider, href }: { provider: WithId<ProviderDoc>; href?: string }) {
  const price = providerStartingPrice(provider);
  const name = providerName(provider);
  const reviews = provider.totalReviews ?? 0;
  return (
    <Link
      href={href ?? `/provider-details?id=${provider.id}`}
      className="group mb-3 flex items-center gap-4 rounded-2xl border border-[var(--rr-outline)]/60 bg-[var(--rr-card)] p-4 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--rr-primary)]/70 hover:bg-[var(--rr-surface-elevated)]"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[var(--rr-primary)] to-[#7a1fa2] text-xl font-bold text-white">
        {provider.profileImage ? (
          <img src={provider.profileImage} alt="" className="h-full w-full object-cover" />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-white">{name}</p>
          {provider.isVerified ? <Badge tone="success">✓ Verified</Badge> : null}
        </div>
        <p className="mt-1 text-xs text-[var(--rr-text-secondary)]">
          <span className="text-[var(--rr-warning)]">★</span> {(provider.rating ?? 0).toFixed(1)}
          <span className="text-[var(--rr-text-tertiary)]">
            {" "}
            ({reviews} review{reviews === 1 ? "" : "s"})
          </span>
          {provider.location?.city ? (
            <span className="text-[var(--rr-text-tertiary)]"> · {provider.location.city}</span>
          ) : null}
        </p>
      </div>
      <div className="shrink-0 text-right">
        {price !== null ? (
          <>
            <p className="text-[10px] uppercase tracking-wider text-[var(--rr-text-tertiary)]">From</p>
            <p className="text-sm font-bold text-[var(--rr-secondary)]">{fmtMoney(price)}</p>
          </>
        ) : null}
        <span className="mt-1 inline-block text-xs text-[var(--rr-text-tertiary)] transition group-hover:translate-x-0.5 group-hover:text-white">
          View →
        </span>
      </div>
    </Link>
  );
}
