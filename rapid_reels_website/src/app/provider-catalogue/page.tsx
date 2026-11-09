"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useState } from "react";
import { FlowScreen } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Badge, Card } from "@/components/ui/Card";
import { AsyncView, Notice } from "@/components/ui/State";
import { useUid } from "@/lib/auth/useUid";
import { deleteCatalogueEvent, listCatalogue } from "@/lib/data/queries";
import { errorMessage, fmtMoney, titleCase } from "@/lib/format";
import { useAsync } from "@/lib/hooks";

export default function Page() {
  const uid = useUid();
  const state = useAsync(() => listCatalogue(uid!, { publishedOnly: false }), [uid], Boolean(uid));
  const [error, setError] = useState<string | null>(null);

  async function remove(id: string) {
    if (!uid || !window.confirm("Delete this catalogue event?")) return;
    try {
      await deleteCatalogueEvent(uid, id);
      state.reload();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <FlowScreen title="Catalogue" subtitle="Showcase the events you shoot" backHref="/provider-dashboard">
      <Button href="/provider-catalogue-edit" className="mb-4 w-full">Add catalogue event</Button>
      {error ? <Notice>{error}</Notice> : null}
      <AsyncView state={state} empty="Your catalogue is empty.">
        {(rows) => (
          <div className="space-y-3">
            {rows.map((c) => (
              <Card key={c.id} className="flex gap-3 p-3">
                {c.heroImageUrl ? <img src={c.heroImageUrl} alt="" className="h-20 w-20 rounded-xl object-cover" /> : <div className="h-20 w-20 rounded-xl bg-white/5" />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-medium text-white">{c.title}</p>
                    <Badge tone={c.isPublished ? "success" : "muted"}>{c.isPublished ? "Published" : "Draft"}</Badge>
                  </div>
                  <p className="text-xs text-[var(--rr-text-tertiary)]">{titleCase(c.eventType)}{c.startingPrice ? ` · from ${fmtMoney(c.startingPrice)}` : ""}</p>
                  <div className="mt-2 flex gap-4 text-xs">
                    <Link href={`/provider-catalogue-edit?id=${c.id}`} className="text-[var(--rr-secondary)]">Edit</Link>
                    <button type="button" className="text-[var(--rr-error)]" onClick={() => remove(c.id)}>Delete</button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </AsyncView>
    </FlowScreen>
  );
}
