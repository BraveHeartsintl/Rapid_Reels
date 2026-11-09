"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FlowScreen } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AsyncView, Empty, Notice } from "@/components/ui/State";
import { Textarea } from "@/components/ui/Textarea";
import { getReel, updateReel } from "@/lib/data/queries";
import type { ReelDoc } from "@/lib/data/types";
import { errorMessage } from "@/lib/format";
import { useAsync, useQuery } from "@/lib/hooks";

function EditorForm({ id, reel }: { id: string; reel: ReelDoc }) {
  const router = useRouter();
  const [title, setTitle] = useState(reel.title ?? "");
  const [description, setDescription] = useState(reel.description ?? "");
  const [hashtags, setHashtags] = useState((reel.hashtags ?? []).map((h) => `#${h}`).join(" "));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locked = reel.moderationStatus === "approved";

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await updateReel(id, {
        title: title.trim(),
        description: description.trim() || null,
        hashtags: hashtags.split(/[\s,]+/).map((h) => h.replace(/^#/, "")).filter(Boolean),
      });
      router.push("/provider-my-reels");
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      {reel.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={reel.thumbnailUrl} alt="" className="mx-auto aspect-[3/4] w-40 rounded-2xl object-cover" />
      ) : null}
      {locked ? <Notice>This reel is approved and public, so it can no longer be edited. Contact support to change it.</Notice> : null}
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={locked} />
      <Textarea label="Description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} disabled={locked} />
      <Input label="Hashtags" value={hashtags} onChange={(e) => setHashtags(e.target.value)} disabled={locked} />
      {error ? <Notice>{error}</Notice> : null}
      <Button type="submit" className="w-full" disabled={busy || locked}>{busy ? "Saving…" : "Save changes"}</Button>
    </form>
  );
}

export default function Page() {
  const query = useQuery();
  const id = query.get("id");
  const state = useAsync(() => getReel(id!), [id], query.ready && Boolean(id));

  return (
    <FlowScreen title="Edit reel" subtitle="Update how this reel is described" backHref="/provider-my-reels">
      {query.ready && !id ? (
        <Empty>No reel selected. <a href="/provider-my-reels" className="underline">My reels</a></Empty>
      ) : (
        <AsyncView state={state} empty="Reel not found." isEmpty={(d) => d === null}>
          {(r) => (r ? <EditorForm id={id!} reel={r} /> : null)}
        </AsyncView>
      )}
    </FlowScreen>
  );
}
