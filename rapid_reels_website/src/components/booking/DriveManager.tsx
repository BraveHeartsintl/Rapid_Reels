"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { Badge, Card } from "@/components/ui/Card";
import { AsyncView, Notice } from "@/components/ui/State";
import { useAuth } from "@/lib/auth/AuthProvider";
import { addDriveFile, getDriveMeta, listDriveFiles } from "@/lib/data/queries";
import { safeFileName, uploadFile } from "@/lib/data/storage";
import { errorMessage, fmtDate } from "@/lib/format";
import { toDate } from "@/lib/data/types";
import { useAsync } from "@/lib/hooks";

/** Provider view of a booking's drive: upload raw footage and see what has been shared. */
export function DriveManager({ bookingId }: { bookingId: string }) {
  const { user } = useAuth();
  const state = useAsync(async () => {
    const [meta, files] = await Promise.all([getDriveMeta(bookingId).catch(() => null), listDriveFiles(bookingId)]);
    return { meta, files };
  }, [bookingId]);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFiles(list: FileList | null) {
    if (!list || !user) return;
    setError(null);
    try {
      for (const file of Array.from(list)) {
        setProgress(0);
        const up = await uploadFile(
          `bookings/${bookingId}/original_photos_videos/${safeFileName(file.name)}`,
          file,
          setProgress,
        );
        await addDriveFile(
          bookingId,
          {
            storagePath: up.path,
            downloadUrl: up.url,
            fileName: file.name,
            mimeType: file.type || "application/octet-stream",
            sizeBytes: file.size,
          },
          user.uid,
        );
      }
      state.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="space-y-4">
      <label className="block cursor-pointer rounded-2xl border border-dashed border-[var(--rr-outline)] bg-[var(--rr-surface)] p-6 text-center text-sm text-[var(--rr-text-tertiary)]">
        {progress === null ? "Tap to upload photos or videos" : `Uploading… ${progress}%`}
        <input type="file" multiple accept="image/*,video/*" className="hidden" disabled={progress !== null} onChange={(e) => onFiles(e.target.files)} />
      </label>
      {error ? <Notice>{error}</Notice> : null}
      <AsyncView state={state} empty="No files uploaded yet." isEmpty={(d) => d.files.length === 0}>
        {({ meta, files }) => (
          <div className="space-y-3">
            <Badge tone={meta?.isSharedWithCustomer ? "success" : "muted"}>
              {meta?.isSharedWithCustomer ? "Shared with customer" : "Awaiting admin approval to share"}
            </Badge>
            <div className="grid grid-cols-2 gap-3">
              {files.map((f) => (
                <a key={f.id} href={f.downloadUrl} target="_blank" rel="noreferrer">
                  <Card className="overflow-hidden p-0">
                    {f.mimeType?.startsWith("image/") && f.downloadUrl ? (
                      <img src={f.downloadUrl} alt={f.fileName} className="aspect-square w-full object-cover" />
                    ) : (
                      <div className="flex aspect-square items-center justify-center bg-white/5 text-2xl">▶</div>
                    )}
                    <div className="p-2">
                      <p className="truncate text-xs text-white">{f.fileName}</p>
                      <p className="text-[10px] text-[var(--rr-text-tertiary)]">
                        {f.folderType} · {fmtDate(toDate(f.uploadedAt))}
                      </p>
                    </div>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        )}
      </AsyncView>
    </div>
  );
}
