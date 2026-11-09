"use client";

import { useRouter } from "next/navigation";
import { FlowScreen } from "@/components/layout/FlowScreen";
import { providerName } from "@/components/provider/ProviderCard";
import { Button } from "@/components/ui/Button";
import { Badge, Card } from "@/components/ui/Card";
import { AsyncView, Empty } from "@/components/ui/State";
import { saveDraft } from "@/lib/booking/draft";
import { useProviderId } from "@/lib/booking/useProviderId";
import { getProvider, listProviderReviews } from "@/lib/data/queries";
import { fmtDate, fmtMoney } from "@/lib/format";
import { useAsync } from "@/lib/hooks";

export default function Page() {
  const router = useRouter();
  const { ready, providerId } = useProviderId();
  const state = useAsync(
    async () => {
      const provider = await getProvider(providerId!);
      if (!provider) return null;
      const reviews = await listProviderReviews(providerId!).catch(() => []);
      return { provider, reviews };
    },
    [providerId],
    ready && Boolean(providerId),
  );

  return (
    <FlowScreen title="Provider details" subtitle="Portfolio, reviews, and offerings" backHref="/provider-selection">
      {ready && !providerId ? (
        <Empty>
          No provider selected. <a href="/provider-selection" className="underline">Browse providers</a>
        </Empty>
      ) : (
        <AsyncView state={state} empty="This provider could not be found." isEmpty={(d) => d === null}>
          {(data) => {
            if (!data) return null;
            const { provider: p, reviews } = data;
            return (
              <div className="space-y-4">
                <Card>
                  <div className="flex justify-between">
                    <h2 className="text-lg font-semibold text-white">{providerName(p)}</h2>
                    {p.isVerified ? <Badge tone="success">Verified</Badge> : null}
                  </div>
                  <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">
                    ★ {(p.rating ?? 0).toFixed(1)} ({p.totalReviews ?? 0} reviews)
                    {p.location?.city ? ` · ${p.location.city}` : ""}
                  </p>
                  {p.eventTypes?.length ? (
                    <p className="mt-2 text-sm text-[var(--rr-text-tertiary)]">{p.eventTypes.join(" · ")}</p>
                  ) : null}
                </Card>
                {p.bio ? (
                  <Card>
                    <p className="text-sm text-[var(--rr-text-secondary)]">About</p>
                    <p className="mt-2 text-sm text-white">{p.bio}</p>
                  </Card>
                ) : null}
                {p.packages?.length ? (
                  <Card>
                    <p className="text-sm text-[var(--rr-text-secondary)]">Packages</p>
                    <ul className="mt-2 space-y-2 text-sm text-white">
                      {p.packages.map((pk) => (
                        <li key={pk.packageId} className="flex justify-between">
                          <span>{pk.name}</span>
                          <span className="text-[var(--rr-secondary)]">{fmtMoney(pk.price)}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                ) : null}
                <Card>
                  <p className="text-sm text-[var(--rr-text-secondary)]">Reviews</p>
                  {reviews.length === 0 ? (
                    <p className="mt-2 text-sm text-[var(--rr-text-tertiary)]">No reviews yet.</p>
                  ) : (
                    <ul className="mt-2 space-y-3">
                      {reviews.slice(0, 5).map((r) => (
                        <li key={r.id} className="text-sm">
                          <p className="text-white">★ {r.rating ?? 0} · <span className="text-[var(--rr-text-tertiary)]">{fmtDate(r.createdAt)}</span></p>
                          {r.comment ? <p className="text-[var(--rr-text-secondary)]">{r.comment}</p> : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
                <div className="flex gap-3">
                  <Button href={`/provider-portfolio?id=${p.id}`} variant="outline" className="flex-1">
                    Portfolio
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={() => {
                      saveDraft({ providerId: p.id, providerName: providerName(p) });
                      router.push(`/catalogue-selection?id=${p.id}`);
                    }}
                  >
                    Book this provider
                  </Button>
                </div>
              </div>
            );
          }}
        </AsyncView>
      )}
    </FlowScreen>
  );
}
