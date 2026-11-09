"use client";

import { providerName } from "@/components/provider/ProviderCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AsyncView } from "@/components/ui/State";
import { listProviders } from "@/lib/data/queries";
import { fmtMoney } from "@/lib/format";
import { useAsync } from "@/lib/hooks";

/** Live package offerings pulled from active providers (cheapest first). */
export function PackagesGrid() {
  const state = useAsync(async () => {
    const providers = await listProviders();
    return providers
      .flatMap((p) =>
        (p.packages ?? []).map((pk) => ({ provider: p, pkg: pk })),
      )
      .sort((a, b) => a.pkg.price - b.pkg.price)
      .slice(0, 9);
  }, []);

  return (
    <AsyncView state={state} empty="No packages are published yet. Check back soon.">
      {(rows) => (
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {rows.map(({ provider, pkg }) => (
            <Card key={`${provider.id}-${pkg.packageId}`} className="flex flex-col">
              <p className="text-sm text-[var(--rr-secondary)]">{pkg.duration} min coverage</p>
              <h2 className="mt-2 text-xl font-semibold text-white">{pkg.name}</h2>
              <p className="mt-1 text-xs text-[var(--rr-text-tertiary)]">by {providerName(provider)}</p>
              <p className="mt-3 text-3xl font-bold text-white">{fmtMoney(pkg.price)}</p>
              <ul className="mt-6 flex-1 space-y-2 text-sm text-[var(--rr-text-secondary)]">
                <li>• {pkg.reelsCount} reels</li>
                {(pkg.features ?? []).map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              <Button href={`/provider-details?id=${provider.id}`} className="mt-8 w-full">
                View provider
              </Button>
            </Card>
          ))}
        </div>
      )}
    </AsyncView>
  );
}
