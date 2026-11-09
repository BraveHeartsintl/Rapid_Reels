import Link from "next/link";
import { Badge, Card } from "@/components/ui/Card";
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
  return (
    <Link href={href ?? `/provider-details?id=${provider.id}`}>
      <Card className="mb-3 transition hover:border-[var(--rr-primary)]">
        <div className="flex justify-between gap-2">
          <div>
            <p className="font-medium text-white">{providerName(provider)}</p>
            <p className="text-xs text-[var(--rr-text-tertiary)]">
              ★ {(provider.rating ?? 0).toFixed(1)} · {provider.totalReviews ?? 0} reviews
              {price !== null ? ` · from ${fmtMoney(price)}` : ""}
            </p>
            {provider.location?.city ? (
              <p className="mt-1 text-xs text-[var(--rr-text-tertiary)]">{provider.location.city}</p>
            ) : null}
          </div>
          {provider.isVerified ? <Badge tone="success">Verified</Badge> : null}
        </div>
      </Card>
    </Link>
  );
}
