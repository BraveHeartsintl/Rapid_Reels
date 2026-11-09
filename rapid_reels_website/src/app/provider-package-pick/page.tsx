"use client";

import { useRouter } from "next/navigation";
import { FlowScreen } from "@/components/layout/FlowScreen";
import { AsyncView, Empty } from "@/components/ui/State";
import { saveDraft, useBookingDraft } from "@/lib/booking/draft";
import { useProviderId } from "@/lib/booking/useProviderId";
import { getProvider } from "@/lib/data/queries";
import { fmtMoney } from "@/lib/format";
import { useAsync } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export default function Page() {
  const router = useRouter();
  const draft = useBookingDraft();
  const { ready, providerId } = useProviderId();
  const state = useAsync(
    async () => {
      const p = await getProvider(providerId!);
      return p ? { provider: p } : null;
    },
    [providerId],
    ready && Boolean(providerId),
  );

  return (
    <FlowScreen
      title="Choose package"
      subtitle="Transparent pricing for your event"
      backHref={providerId ? `/catalogue-selection?id=${providerId}` : "/provider-selection"}
    >
      {ready && !providerId ? (
        <Empty>
          Pick a provider first. <a href="/provider-selection" className="underline">Browse providers</a>
        </Empty>
      ) : (
        <AsyncView state={state} empty="This provider could not be found." isEmpty={(d) => d === null}>
          {(data) => {
            if (!data) return null;
            const all = data.provider.packages ?? [];
            const allowed = draft.cataloguePackageIds?.length
              ? all.filter((p) => draft.cataloguePackageIds!.includes(p.packageId))
              : all;
            const packages = allowed.length ? allowed : all;
            if (packages.length === 0) return <Empty>This provider has not published packages yet.</Empty>;
            return (
              <div className="space-y-3">
                {packages.map((p) => (
                  <button
                    key={p.packageId}
                    type="button"
                    className={cn(
                      "block w-full rounded-2xl border bg-[var(--rr-card)] p-4 text-left",
                      draft.package?.packageId === p.packageId
                        ? "border-[var(--rr-primary)]"
                        : "border-[var(--rr-outline)]/50",
                    )}
                    onClick={() => {
                      saveDraft({
                        providerId: data.provider.id,
                        providerName: data.provider.businessName || data.provider.ownerName,
                        package: {
                          packageId: p.packageId,
                          name: p.name,
                          price: p.price,
                          duration: p.duration,
                          reelsCount: p.reelsCount,
                          editingStyle: p.editingStyle,
                          deliveryTime: p.deliveryTime,
                          features: p.features ?? [],
                        },
                        currency: "gbp",
                      });
                      router.push("/package-customization");
                    }}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium text-white">{p.name}</span>
                      <span className="text-[var(--rr-secondary)]">{fmtMoney(p.price)}</span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--rr-text-tertiary)]">
                      {p.duration} min · {p.reelsCount} reels · {p.editingStyle}
                    </p>
                    {p.features?.length ? (
                      <ul className="mt-2 space-y-0.5 text-xs text-[var(--rr-text-secondary)]">
                        {p.features.map((f) => (
                          <li key={f}>• {f}</li>
                        ))}
                      </ul>
                    ) : null}
                  </button>
                ))}
              </div>
            );
          }}
        </AsyncView>
      )}
    </FlowScreen>
  );
}
