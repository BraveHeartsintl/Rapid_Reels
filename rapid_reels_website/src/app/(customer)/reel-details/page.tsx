"use client";

import { PageHeader } from "@/components/layout/FlowScreen";
import { providerName } from "@/components/provider/ProviderCard";
import { Button } from "@/components/ui/Button";
import { Badge, Card } from "@/components/ui/Card";
import { AsyncView, Empty } from "@/components/ui/State";
import { getProvider, getReel } from "@/lib/data/queries";
import { fmtDate, titleCase } from "@/lib/format";
import { useAsync, useQuery } from "@/lib/hooks";

export default function Page() {
  const query = useQuery();
  const id = query.get("id");
  const state = useAsync(
    async () => {
      const reel = await getReel(id!);
      if (!reel) return null;
      const provider = reel.providerId ? await getProvider(reel.providerId).catch(() => null) : null;
      return { reel, provider };
    },
    [id],
    query.ready && Boolean(id),
  );

  if (query.ready && !id) return <Empty>No reel selected.</Empty>;

  return (
    <div>
      <PageHeader title="Reel details" />
      <AsyncView state={state} empty="This reel is not available." isEmpty={(d) => d === null}>
        {(data) => {
          if (!data) return null;
          const { reel: r, provider } = data;
          return (
            <>
              <Card className="space-y-2 text-sm">
                <p className="text-base font-medium text-white">{r.title || r.eventName}</p>
                <p className="text-[var(--rr-text-tertiary)]">
                  {titleCase(r.eventType)}
                  {provider ? ` · ${providerName(provider)}` : ""}
                </p>
                {r.description ? <p className="text-[var(--rr-text-secondary)]">{r.description}</p> : null}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge tone="secondary">{titleCase(r.status)}</Badge>
                  {r.metadata?.quality ? <Badge tone="muted">{r.metadata.quality}</Badge> : null}
                  {r.duration ? <Badge tone="muted">{r.duration}s</Badge> : null}
                  {r.metadata?.editingStyle ? <Badge tone="muted">{titleCase(r.metadata.editingStyle)}</Badge> : null}
                </div>
                <p className="text-xs text-[var(--rr-text-tertiary)]">
                  Delivered {fmtDate(r.deliveredAt ?? r.createdAt)}
                </p>
                {r.hashtags?.length ? (
                  <p className="text-xs text-[var(--rr-secondary)]">{r.hashtags.map((h) => `#${h.replace(/^#/, "")}`).join(" ")}</p>
                ) : null}
              </Card>
              <div className="mt-4 flex gap-2">
                <Button href={`/reel-player?id=${r.id}`}>Play</Button>
                <Button href={`/reel-share?id=${r.id}`} variant="outline">Share</Button>
              </div>
            </>
          );
        }}
      </AsyncView>
    </div>
  );
}
