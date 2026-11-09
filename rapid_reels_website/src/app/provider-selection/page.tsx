"use client";

import { FlowScreen } from "@/components/layout/FlowScreen";
import { ProviderCard } from "@/components/provider/ProviderCard";
import { AsyncView } from "@/components/ui/State";
import { useBookingDraft } from "@/lib/booking/draft";
import { listProviders } from "@/lib/data/queries";
import { titleCase } from "@/lib/format";
import { useAsync } from "@/lib/hooks";

export default function Page() {
  const draft = useBookingDraft();
  const state = useAsync(async () => {
    const all = await listProviders();
    return all.filter((p) => {
      const cityOk = !draft.city || (p.location?.city ?? "").toLowerCase() === draft.city.toLowerCase();
      const typeOk =
        !draft.eventType ||
        !p.eventTypes?.length ||
        p.eventTypes.some((t) => t.toLowerCase() === draft.eventType);
      return cityOk && typeOk;
    });
  }, [draft.city, draft.eventType]);

  const parts = [draft.eventType ? titleCase(draft.eventType) : null, draft.city].filter(Boolean);

  return (
    <FlowScreen
      title="Choose provider"
      subtitle={parts.length ? `Creators for ${parts.join(" in ")}` : "Verified creators near you"}
      backHref="/event-type-selection"
    >
      <AsyncView state={state} empty="No providers match yet. Try another event type or city.">
        {(providers) => (
          <div>
            {providers.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        )}
      </AsyncView>
    </FlowScreen>
  );
}
