"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { AsyncView, Empty, Notice } from "@/components/ui/State";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  addReelComment,
  getProvider,
  getReel,
  listReelComments,
  setReelLike,
  submitContentReport,
} from "@/lib/data/queries";
import { fmtDate, errorMessage } from "@/lib/format";
import { useAsync, useQuery } from "@/lib/hooks";
import { providerName } from "@/components/provider/ProviderCard";
import { getDb } from "@/lib/firebase";
import { doc, increment, updateDoc } from "firebase/firestore";

export default function Page() {
  const query = useQuery();
  const id = query.get("id");
  const { user } = useAuth();
  const uid = user?.uid ?? null;

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
  const comments = useAsync(() => listReelComments(id!), [id], query.ready && Boolean(id));

  const [likedOverride, setLikedOverride] = useState<boolean | null>(null);
  const [likeDelta, setLikeDelta] = useState(0);
  const [text, setText] = useState("");
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  const reel = state.data?.reel;
  const isPublic = reel?.isPublic;
  useEffect(() => {
    if (id && isPublic) {
      // best-effort view counter; allowed by rules for public reels
      void updateDoc(doc(getDb(), "reels", id), { "analytics.views": increment(1) }).catch(() => undefined);
    }
  }, [id, isPublic]);

  const liked = likedOverride ?? Boolean(uid && reel?.likedBy?.includes(uid));

  async function toggleLike() {
    if (!uid || !id) return;
    const next = !liked;
    setLikedOverride(next);
    setLikeDelta((d) => d + (next ? 1 : -1));
    try {
      await setReelLike(id, uid, next);
    } catch (e) {
      setLikedOverride(!next);
      setLikeDelta((d) => d + (next ? -1 : 1));
      setMsg({ tone: "error", text: errorMessage(e) });
    }
  }

  async function postComment(e: React.FormEvent) {
    e.preventDefault();
    if (!uid || !id || !text.trim()) return;
    try {
      await addReelComment(id, uid, text.trim());
      setText("");
      comments.reload();
    } catch (err) {
      setMsg({ tone: "error", text: errorMessage(err) });
    }
  }

  async function report() {
    if (!uid || !id || !reel) return;
    const reason = window.prompt("Why are you reporting this reel?");
    if (!reason) return;
    try {
      await submitContentReport({ reporterId: uid, reelId: id, reportedUserId: reel.providerId ?? "", reason });
      setMsg({ tone: "success", text: "Thanks — our team will review this within 24 hours." });
    } catch (err) {
      setMsg({ tone: "error", text: errorMessage(err) });
    }
  }

  if (query.ready && !id) return <Empty>No reel selected.</Empty>;

  return (
    <AsyncView state={state} empty="This reel is not available." isEmpty={(d) => d === null}>
      {(data) => {
        if (!data) return null;
        const r = data.reel;
        const likes = Math.max(0, (r.analytics?.likes ?? 0) + likeDelta);
        return (
          <div>
            <PageHeader title={r.title || r.eventName || "Reel"} subtitle={data.provider ? providerName(data.provider) : undefined} />
            <div className="mb-4 overflow-hidden rounded-2xl bg-black">
              {r.videoUrl ? (
                <video
                  src={r.videoUrl}
                  poster={r.thumbnailUrl || undefined}
                  controls
                  playsInline
                  className="mx-auto max-h-[60vh] w-full"
                />
              ) : (
                <div className="flex aspect-[9/16] max-h-[60vh] items-center justify-center text-[var(--rr-text-tertiary)]">
                  Video is still processing
                </div>
              )}
            </div>
            <p className="text-sm text-[var(--rr-text-secondary)]">
              ♥ {likes} · 💬 {r.analytics?.comments ?? 0} · ▶ {r.analytics?.views ?? 0}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" variant={liked ? "primary" : "outline"} onClick={toggleLike}>
                {liked ? "♥ Liked" : "♡ Like"}
              </Button>
              <Button href={`/reel-details?id=${r.id}`} variant="outline">Details</Button>
              <Button href={`/reel-share?id=${r.id}`}>Share</Button>
              <Button type="button" variant="ghost" onClick={report}>Report</Button>
            </div>
            {msg ? <div className="mt-3"><Notice tone={msg.tone}>{msg.text}</Notice></div> : null}

            <h2 className="mb-2 mt-8 text-sm font-semibold text-[var(--rr-text-secondary)]">Comments</h2>
            {r.isPublic ? (
              <form onSubmit={postComment} className="mb-4 flex items-end gap-2">
                <Input placeholder="Add a comment" value={text} onChange={(e) => setText(e.target.value)} />
                <Button type="submit" disabled={!text.trim()}>Post</Button>
              </form>
            ) : null}
            <AsyncView state={comments} empty="No comments yet.">
              {(rows) => (
                <div className="space-y-2">
                  {rows.map((c) => (
                    <Card key={c.id} className="p-3 text-sm">
                      <p className="text-white">{c.text}</p>
                      <p className="mt-1 text-[10px] text-[var(--rr-text-tertiary)]">
                        {c.userId === uid ? "You" : "Member"} · {fmtDate(c.createdAt)}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </AsyncView>
          </div>
        );
      }}
    </AsyncView>
  );
}
