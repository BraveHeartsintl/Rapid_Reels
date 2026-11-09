"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FlowScreen } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AsyncView, Notice } from "@/components/ui/State";
import { Textarea } from "@/components/ui/Textarea";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getCatalogueEvent, getProvider, saveCatalogueEvent } from "@/lib/data/queries";
import { safeFileName, uploadFile } from "@/lib/data/storage";
import type { CatalogueEventDoc, PackageOffering } from "@/lib/data/types";
import { errorMessage, EVENT_TYPES, fmtMoney } from "@/lib/format";
import { useAsync, useQuery } from "@/lib/hooks";

type Loaded = { event: CatalogueEventDoc | null; packages: PackageOffering[] };

function EditForm({ uid, id, data }: { uid: string; id: string | null; data: Loaded }) {
  const router = useRouter();
  const e0 = data.event ?? {};
  const [title, setTitle] = useState(e0.title ?? "");
  const [shortDescription, setShort] = useState(e0.shortDescription ?? "");
  const [longDescription, setLong] = useState(e0.longDescription ?? "");
  const [eventType, setEventType] = useState(e0.eventType ?? EVENT_TYPES[0].id);
  const [highlights, setHighlights] = useState((e0.highlights ?? []).join("\n"));
  const [tags, setTags] = useState((e0.tags ?? []).join(", "));
  const [durationLabel, setDuration] = useState(e0.durationLabel ?? "");
  const [sortOrder, setSort] = useState(String(e0.sortOrder ?? 0));
  const [packageIds, setPackageIds] = useState<string[]>(e0.packageIds ?? []);
  const [isPublished, setPublished] = useState(Boolean(e0.isPublished));
  const [hero, setHero] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const selected = data.packages.filter((p) => packageIds.includes(p.packageId));
      const prices = selected.map((p) => p.price).filter((p) => p > 0);
      const payload: CatalogueEventDoc = {
        title: title.trim(),
        shortDescription: shortDescription.trim(),
        longDescription: longDescription.trim(),
        eventType,
        highlights: highlights.split("\n").map((s) => s.trim()).filter(Boolean),
        tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
        durationLabel: durationLabel.trim(),
        sortOrder: Number(sortOrder) || 0,
        packageIds,
        isPublished,
        startingPrice: prices.length ? Math.min(...prices) : 0,
      };
      if (hero) {
        const up = await uploadFile(`providers/${uid}/catalogue/${safeFileName(hero.name)}`, hero);
        payload.heroImageUrl = up.url;
      }
      await saveCatalogueEvent(uid, id, payload);
      router.push("/provider-catalogue");
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <Input label="Short description" value={shortDescription} onChange={(e) => setShort(e.target.value)} />
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-[var(--rr-text-secondary)]">Event type</span>
        <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="rounded-2xl border border-[var(--rr-outline)] bg-[var(--rr-surface)] px-4 py-3 text-white">
          {EVENT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </label>
      <Textarea label="Full description" value={longDescription} onChange={(e) => setLong(e.target.value)} />
      <Textarea label="Highlights (one per line)" rows={3} value={highlights} onChange={(e) => setHighlights(e.target.value)} />
      <Input label="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
      <Input label="Duration label" placeholder="e.g. Full day" value={durationLabel} onChange={(e) => setDuration(e.target.value)} />
      <Input label="Sort order" type="number" value={sortOrder} onChange={(e) => setSort(e.target.value)} />
      <label className="block rounded-2xl border border-dashed border-[var(--rr-outline)] bg-[var(--rr-surface)] p-5 text-center text-sm text-[var(--rr-text-tertiary)]">
        {hero ? hero.name : e0.heroImageUrl ? "Replace hero image" : "Upload hero image"}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => setHero(e.target.files?.[0] ?? null)} />
      </label>
      <div>
        <p className="mb-2 text-sm text-[var(--rr-text-secondary)]">Packages offered for this event</p>
        {data.packages.length === 0 ? (
          <p className="text-xs text-[var(--rr-text-tertiary)]">Add packages in your business profile first.</p>
        ) : (
          <div className="space-y-2">
            {data.packages.map((p) => (
              <label key={p.packageId} className="flex items-center gap-3 rounded-2xl bg-[var(--rr-card)] px-4 py-3 text-sm text-white">
                <input
                  type="checkbox"
                  className="accent-[var(--rr-primary)]"
                  checked={packageIds.includes(p.packageId)}
                  onChange={(ev) => setPackageIds((l) => (ev.target.checked ? [...l, p.packageId] : l.filter((x) => x !== p.packageId)))}
                />
                {p.name} · {fmtMoney(p.price)}
              </label>
            ))}
          </div>
        )}
      </div>
      <label className="flex items-center gap-3 text-sm text-white">
        <input type="checkbox" className="accent-[var(--rr-primary)]" checked={isPublished} onChange={(e) => setPublished(e.target.checked)} /> Published (visible to customers)
      </label>
      {error ? <Notice>{error}</Notice> : null}
      <Button type="submit" className="w-full" disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
    </form>
  );
}

export default function Page() {
  const uid = useAuth().user?.uid ?? null;
  const query = useQuery();
  const id = query.get("id");
  const state = useAsync<Loaded>(
    async () => {
      const [event, provider] = await Promise.all([id ? getCatalogueEvent(uid!, id) : Promise.resolve(null), getProvider(uid!)]);
      return { event, packages: provider?.packages ?? [] };
    },
    [uid, id],
    Boolean(uid) && query.ready,
  );

  return (
    <FlowScreen title={id ? "Edit catalogue event" : "New catalogue event"} backHref="/provider-catalogue">
      <AsyncView state={state} isEmpty={() => false}>
        {(data) => <EditForm uid={uid!} id={id} data={data} />}
      </AsyncView>
    </FlowScreen>
  );
}
