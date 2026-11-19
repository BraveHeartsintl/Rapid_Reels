"use client";

import { useRouter } from "next/navigation";
import { FlowScreen } from "@/components/layout/FlowScreen";
import { providerName, providerStartingPrice } from "@/components/provider/ProviderCard";
import { Button } from "@/components/ui/Button";
import { Badge, Card } from "@/components/ui/Card";
import { AsyncView, Empty } from "@/components/ui/State";
import { saveDraft } from "@/lib/booking/draft";
import { useProviderId } from "@/lib/booking/useProviderId";
import { getProvider, listProviderReviews } from "@/lib/data/queries";
import { EVENT_TYPES, fmtDate, fmtMoney } from "@/lib/format";
import { useAsync } from "@/lib/hooks";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 text-lg font-semibold text-white">{children}</h2>;
}

function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span aria-label={`${value} out of 5`} className="tracking-tight text-[var(--rr-warning)]">
      {"★".repeat(full)}
      <span className="text-white/15">{"★".repeat(Math.max(0, 5 - full))}</span>
    </span>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-[var(--rr-outline)]/50 bg-white/[0.03] px-4 py-3 text-center">
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="mt-0.5 text-xs text-[var(--rr-text-tertiary)]">{label}</p>
    </div>
  );
}

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
            const name = providerName(p);
            const rating = p.rating ?? 0;
            const startingPrice = providerStartingPrice(p);
            const cover = p.coverImages?.[0];
            const stats = [
              p.totalEventsCompleted ? { value: String(p.totalEventsCompleted), label: "Events done" } : null,
              p.totalReelsDelivered ? { value: String(p.totalReelsDelivered), label: "Reels delivered" } : null,
              p.averageDeliveryTime ? { value: `${p.averageDeliveryTime}h`, label: "Avg. delivery" } : null,
              p.teamSize ? { value: String(p.teamSize), label: "Team size" } : null,
            ].filter((s): s is { value: string; label: string } => s !== null);

            const book = () => {
              saveDraft({ providerId: p.id, providerName: name });
              router.push(`/catalogue-selection?id=${p.id}`);
            };

            return (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
                {/* Hero */}
                <div className="overflow-hidden rounded-3xl border border-[var(--rr-outline)]/60 bg-[var(--rr-card)] shadow-[var(--shadow-card)] lg:col-start-1">
                  <div className="relative h-36 sm:h-48">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-[var(--rr-primary)]/70 via-[#7a1fa2]/50 to-[var(--rr-surface)]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--rr-card)] via-transparent to-transparent" />
                  </div>
                  <div className="px-5 pb-6 sm:px-8">
                    <div className="-mt-12 flex items-end gap-4 sm:-mt-14">
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-[var(--rr-card)] bg-gradient-to-br from-[var(--rr-primary)] to-[#7a1fa2] text-3xl font-bold text-white shadow-lg sm:h-28 sm:w-28">
                        {p.profileImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.profileImage} alt={name} className="h-full w-full object-cover" />
                        ) : (
                          name.charAt(0).toUpperCase()
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{name}</h2>
                      {p.isVerified ? <Badge tone="success">✓ Verified</Badge> : null}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--rr-text-secondary)]">
                      <span className="flex items-center gap-2">
                        <Stars value={rating} />
                        <span className="font-semibold text-white">{rating.toFixed(1)}</span>
                        <span className="text-[var(--rr-text-tertiary)]">({p.totalReviews ?? 0} reviews)</span>
                      </span>
                      {p.location?.city ? (
                        <span className="flex items-center gap-1">
                          <span aria-hidden>📍</span>
                          {p.location.city}
                        </span>
                      ) : null}
                    </div>

                    {p.eventTypes?.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {p.eventTypes.map((t) => {
                          const meta = EVENT_TYPES.find((e) => e.id === t);
                          return (
                            <span
                              key={t}
                              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium capitalize text-[var(--rr-text-secondary)]"
                            >
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ background: meta?.color ?? "var(--rr-accent)" }}
                              />
                              {meta?.label ?? t}
                            </span>
                          );
                        })}
                      </div>
                    ) : null}

                    {stats.length ? (
                      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {stats.map((s) => (
                          <Stat key={s.label} {...s} />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Booking sidebar */}
                <aside className="lg:sticky lg:top-6 lg:col-start-2 lg:row-span-4 lg:row-start-1">
                  <Card className="space-y-5 !rounded-3xl p-6">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[var(--rr-text-tertiary)]">
                        {startingPrice !== null ? "Starting from" : "Pricing"}
                      </p>
                      <p className="mt-1 text-3xl font-bold text-white">
                        {startingPrice !== null ? fmtMoney(startingPrice) : "On request"}
                      </p>
                    </div>
                    <ul className="space-y-2 text-sm text-[var(--rr-text-secondary)]">
                      <li className="flex items-center gap-2">
                        <span className="text-[var(--rr-success)]">✓</span> Verified event creator
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[var(--rr-success)]">✓</span> Reels delivered while the moment is live
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-[var(--rr-success)]">✓</span> Secure payment
                      </li>
                    </ul>
                    <div className="flex flex-col gap-3">
                      <Button type="button" className="w-full" onClick={book}>
                        Book this provider
                      </Button>
                      <Button href={`/provider-portfolio?id=${p.id}`} variant="outline" className="w-full">
                        View portfolio
                      </Button>
                    </div>
                  </Card>
                </aside>

                {p.bio ? (
                  <Card className="!rounded-3xl p-6 sm:p-8 lg:col-start-1">
                    <SectionTitle>About</SectionTitle>
                    <p className="leading-relaxed text-[var(--rr-text-secondary)]">{p.bio}</p>
                  </Card>
                ) : null}

                {p.packages?.length ? (
                  <Card className="!rounded-3xl p-6 sm:p-8 lg:col-start-1">
                    <SectionTitle>Packages</SectionTitle>
                    <ul className="grid gap-4 sm:grid-cols-2">
                      {p.packages.map((pk) => (
                        <li
                          key={pk.packageId}
                          className="flex flex-col rounded-2xl border border-[var(--rr-outline)]/60 bg-white/[0.03] p-5 transition hover:border-[var(--rr-primary)]/60"
                        >
                          <p className="font-semibold text-white">{pk.name}</p>
                          <p className="mt-1 text-2xl font-bold text-[var(--rr-secondary)]">{fmtMoney(pk.price)}</p>
                          <p className="mt-3 text-xs text-[var(--rr-text-tertiary)]">
                            {[
                              pk.duration ? `${pk.duration}h coverage` : null,
                              pk.reelsCount ? `${pk.reelsCount} reel${pk.reelsCount > 1 ? "s" : ""}` : null,
                              pk.deliveryTime ? `${pk.deliveryTime}h delivery` : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                          {pk.features?.length ? (
                            <ul className="mt-3 space-y-1 text-sm text-[var(--rr-text-secondary)]">
                              {pk.features.slice(0, 4).map((f) => (
                                <li key={f} className="flex gap-2">
                                  <span className="text-[var(--rr-success)]">✓</span>
                                  {f}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </Card>
                ) : null}

                <Card className="!rounded-3xl p-6 sm:p-8 lg:col-start-1">
                  <SectionTitle>Reviews</SectionTitle>
                  {reviews.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[var(--rr-outline)] py-8 text-center">
                      <p className="text-2xl">💬</p>
                      <p className="mt-2 text-sm text-[var(--rr-text-tertiary)]">
                        No reviews yet. Be the first to book and share your experience.
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-5">
                      {reviews.slice(0, 5).map((r) => (
                        <li key={r.id} className="border-b border-[var(--rr-outline)]/40 pb-5 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <Stars value={r.rating ?? 0} />
                            <span className="text-xs text-[var(--rr-text-tertiary)]">{fmtDate(r.createdAt)}</span>
                          </div>
                          {r.comment ? (
                            <p className="mt-2 text-[var(--rr-text-secondary)]">{r.comment}</p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </div>
            );
          }}
        </AsyncView>
      )}
    </FlowScreen>
  );
}
