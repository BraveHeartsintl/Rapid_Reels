"use client";

import { Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FlowScreen } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AsyncView, Notice } from "@/components/ui/State";
import { Textarea } from "@/components/ui/Textarea";
import { useUid } from "@/lib/auth/useUid";
import { createReel, listProviderBookings, updateBooking } from "@/lib/data/queries";
import { safeFileName, uploadFile } from "@/lib/data/storage";
import { errorMessage, fmtDate } from "@/lib/format";
import { toDate } from "@/lib/data/types";
import { useAsync, useQuery } from "@/lib/hooks";

function videoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Math.round(v.duration) || 0);
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    v.src = url;
  });
}

export default function Page() {
  const uid = useUid();
  const router = useRouter();
  const query = useQuery();
  const preselected = query.get("id");
  const bookings = useAsync(() => listProviderBookings(uid!), [uid], Boolean(uid));
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [video, setVideo] = useState<File | null>(null);
  const [thumb, setThumb] = useState<File | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedId = bookingId ?? preselected ?? "";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const booking = bookings.data?.find((b) => b.id === selectedId);
    if (!uid || !booking || !video || !thumb) {
      setError("Choose a booking, a video and a thumbnail.");
      return;
    }
    setError(null);
    try {
      setProgress("Uploading video… 0%");
      const [vUp, duration] = await Promise.all([
        uploadFile(`providers/${uid}/reels/${booking.id}/${safeFileName(video.name)}`, video, (p) => setProgress(`Uploading video… ${p}%`)),
        videoDuration(video),
      ]);
      setProgress("Uploading thumbnail…");
      const tUp = await uploadFile(`providers/${uid}/reels/${booking.id}/${safeFileName(thumb.name)}`, thumb);
      setProgress("Saving…");
      await createReel({
        bookingId: booking.id,
        customerId: booking.customerId,
        providerId: uid,
        eventType: booking.eventType,
        eventName: booking.eventName,
        title: title.trim() || booking.eventName,
        description: description.trim() || null,
        videoUrl: vUp.url,
        thumbnailUrl: tUp.url,
        duration,
        status: "delivered",
        hashtags: hashtags.split(/[\s,]+/).map((h) => h.replace(/^#/, "")).filter(Boolean),
        metadata: { editingStyle: booking.package?.editingStyle ?? "standard", quality: "1080p", fileSize: vUp.size, format: video.type },
        deliveredAt: Timestamp.now(),
      });
      if (!booking.eventStatus?.firstReelDelivered) {
        await updateBooking(booking.id, { "eventStatus.firstReelDelivered": new Date() }).catch(() => undefined);
      }
      router.push("/provider-my-reels");
    } catch (err) {
      setError(errorMessage(err));
      setProgress(null);
    }
  }

  return (
    <FlowScreen title="Deliver a reel" subtitle="Upload an edited reel for a booking" backHref="/provider-my-reels">
      <AsyncView state={bookings} empty="You need a booking before you can deliver a reel.">
        {(rows) => {
          const eligible = rows.filter((b) => ["confirmed", "ongoing", "completed"].includes(b.status ?? ""));
          return (
            <form onSubmit={submit} className="space-y-4">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-[var(--rr-text-secondary)]">Booking</span>
                <select
                  value={selectedId}
                  onChange={(e) => setBookingId(e.target.value)}
                  required
                  className="rounded-2xl border border-[var(--rr-outline)] bg-[var(--rr-surface)] px-4 py-3 text-white"
                >
                  <option value="">Select a booking…</option>
                  {eligible.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.eventName} · {fmtDate(toDate(b.eventDate))}
                    </option>
                  ))}
                </select>
              </label>
              <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Defaults to the event name" />
              <Textarea label="Description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              <Input label="Hashtags" value={hashtags} onChange={(e) => setHashtags(e.target.value)} placeholder="#wedding #highlights" />
              <label className="block rounded-2xl border border-dashed border-[var(--rr-outline)] bg-[var(--rr-surface)] p-5 text-center text-sm text-[var(--rr-text-tertiary)]">
                {video ? video.name : "Choose reel video"}
                <input type="file" accept="video/*" className="hidden" onChange={(e) => setVideo(e.target.files?.[0] ?? null)} />
              </label>
              <label className="block rounded-2xl border border-dashed border-[var(--rr-outline)] bg-[var(--rr-surface)] p-5 text-center text-sm text-[var(--rr-text-tertiary)]">
                {thumb ? thumb.name : "Choose thumbnail image"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setThumb(e.target.files?.[0] ?? null)} />
              </label>
              {error ? <Notice>{error}</Notice> : null}
              <Button type="submit" className="w-full" disabled={progress !== null}>{progress ?? "Upload reel"}</Button>
            </form>
          );
        }}
      </AsyncView>
    </FlowScreen>
  );
}
