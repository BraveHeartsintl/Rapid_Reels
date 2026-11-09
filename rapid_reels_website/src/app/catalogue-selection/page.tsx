"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { FlowScreen } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AsyncView, Empty } from "@/components/ui/State";
import { saveDraft } from "@/lib/booking/draft";
import { useProviderId } from "@/lib/booking/useProviderId";
import { listCatalogue } from "@/lib/data/queries";
import { fmtMoney } from "@/lib/format";
import { useAsync } from "@/lib/hooks";

export default function Page() {
  const router = useRouter();
  const { ready, providerId } = useProviderId();
  const state = useAsync(() => listCatalogue(providerId!), [providerId], ready && Boolean(providerId));
  const packHref = `/provider-package-pick${providerId ? `?id=${providerId}` : ""}`;

  return (
    <FlowScreen
      title="Catalogue"
      subtitle="Pick a bookable offering"
      backHref={providerId ? `/provider-details?id=${providerId}` : "/provider-selection"}
    >
      {ready && !providerId ? (
        <Empty>No provider selected.</Empty>
      ) : (
        <div className="space-y-3">
          <AsyncView state={state} empty="This provider has no catalogue offerings. Choose a package directly.">
            {(items) => (
              <>
                {items.map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    className="block w-full text-left"
                    onClick={() => {
                      saveDraft({
                        catalogueEventId: i.id,
                        catalogueTitle: i.title,
                        catalogueHeroUrl: i.heroImageUrl,
                        cataloguePackageIds: i.packageIds ?? [],
                        eventType: i.eventType ?? undefined,
                      });
                      router.push(packHref);
                    }}
                  >
                    <Card className="overflow-hidden p-0">
                      {i.heroImageUrl ? (
                        <img src={i.heroImageUrl} alt="" className="h-36 w-full object-cover" />
                      ) : null}
                      <div className="flex justify-between gap-3 p-4">
                        <div>
                          <p className="font-medium text-white">{i.title}</p>
                          {i.shortDescription ? (
                            <p className="mt-1 text-xs text-[var(--rr-text-tertiary)]">{i.shortDescription}</p>
                          ) : null}
                        </div>
                        {i.startingPrice ? (
                          <span className="shrink-0 text-[var(--rr-secondary)]">from {fmtMoney(i.startingPrice)}</span>
                        ) : null}
                      </div>
                    </Card>
                  </button>
                ))}
              </>
            )}
          </AsyncView>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              saveDraft({ catalogueEventId: undefined, catalogueTitle: undefined, catalogueHeroUrl: undefined, cataloguePackageIds: undefined });
              router.push(packHref);
            }}
          >
            Skip — choose a package
          </Button>
        </div>
      )}
    </FlowScreen>
  );
}
