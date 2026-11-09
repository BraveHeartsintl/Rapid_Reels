"use client";

import { FlowScreen } from "@/components/layout/FlowScreen";
import { ReelTile } from "@/components/reel/ReelTile";
import { AsyncView, Empty } from "@/components/ui/State";
import { useProviderId } from "@/lib/booking/useProviderId";
import { listProviderPublicReels } from "@/lib/data/queries";
import { useAsync } from "@/lib/hooks";

export default function Page() {
  const { ready, providerId } = useProviderId();
  const state = useAsync(() => listProviderPublicReels(providerId!), [providerId], ready && Boolean(providerId));

  return (
    <FlowScreen
      title="Portfolio"
      subtitle="Sample work from this provider"
      backHref={providerId ? `/provider-details?id=${providerId}` : "/provider-selection"}
      nextHref={providerId ? `/catalogue-selection?id=${providerId}` : undefined}
      nextLabel="Continue to booking"
    >
      {ready && !providerId ? (
        <Empty>No provider selected.</Empty>
      ) : (
        <AsyncView state={state} empty="This provider has no published reels yet.">
          {(reels) => (
            <div className="grid grid-cols-2 gap-3">
              {reels.map((r) => (
                <ReelTile key={r.id} reel={r} href={`/reel-player?id=${r.id}`} showStats />
              ))}
            </div>
          )}
        </AsyncView>
      )}
    </FlowScreen>
  );
}
