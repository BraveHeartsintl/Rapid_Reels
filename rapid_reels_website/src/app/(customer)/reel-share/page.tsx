"use client";

import { useState } from "react";
import { doc, increment, updateDoc } from "firebase/firestore";
import { PageHeader } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { AsyncView, Empty, Notice } from "@/components/ui/State";
import { getReel } from "@/lib/data/queries";
import { getDb } from "@/lib/firebase";
import { useAsync, useQuery } from "@/lib/hooks";

export default function Page() {
  const query = useQuery();
  const id = query.get("id");
  const state = useAsync(() => getReel(id!), [id], query.ready && Boolean(id));
  const [msg, setMsg] = useState<string | null>(null);

  function link(): string {
    return `${window.location.origin}/reel-player?id=${id}`;
  }
  function countShare() {
    if (id) void updateDoc(doc(getDb(), "reels", id), { "analytics.shares": increment(1) }).catch(() => undefined);
  }
  async function copy() {
    await navigator.clipboard.writeText(link());
    countShare();
    setMsg("Link copied to clipboard.");
  }
  async function nativeShare(title: string) {
    if (navigator.share) {
      await navigator.share({ title, url: link() }).catch(() => undefined);
      countShare();
    } else {
      await copy();
    }
  }

  if (query.ready && !id) return <Empty>No reel selected.</Empty>;

  return (
    <div>
      <PageHeader title="Share reel" subtitle="Send this moment to friends" />
      <AsyncView state={state} empty="This reel is not available." isEmpty={(d) => d === null}>
        {(reel) => {
          if (!reel) return null;
          const title = reel.title || reel.eventName || "Rapid Reels";
          return (
            <div className="flex flex-col gap-2">
              {!reel.isPublic ? (
                <Notice>This reel is private, so only people with access to your account can open the link.</Notice>
              ) : null}
              <Button type="button" onClick={() => nativeShare(title)}>Share…</Button>
              <a
                onClick={countShare}
                href={`https://wa.me/?text=${encodeURIComponent(`${title} ${typeof window !== "undefined" ? link() : ""}`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl border border-[var(--rr-primary)] px-6 py-3 text-sm font-semibold text-[var(--rr-primary)]"
              >
                WhatsApp
              </a>
              <Button type="button" variant="outline" onClick={copy}>Copy link</Button>
              {msg ? <Notice tone="success">{msg}</Notice> : null}
              <Button variant="ghost" href="/discover">Done</Button>
            </div>
          );
        }}
      </AsyncView>
    </div>
  );
}
