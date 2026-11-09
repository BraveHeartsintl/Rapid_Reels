"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Badge, Card } from "@/components/ui/Card";
import { AsyncView, Empty, Notice } from "@/components/ui/State";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getBooking, getDriveMeta, listAllBookings, listDriveFiles, setDriveShared } from "@/lib/data/queries";
import { errorMessage, fmtDate } from "@/lib/format";
import { toDate } from "@/lib/data/types";
import { useAsync, useQuery } from "@/lib/hooks";

function DrivePanel({ id }: { id: string }) {
  const { user } = useAuth();
  const state = useAsync(async () => {
    const [booking, meta, files] = await Promise.all([getBooking(id), getDriveMeta(id), listDriveFiles(id)]);
    return { booking, meta, files };
  }, [id]);
  const [error, setError] = useState<string | null>(null);

  async function toggle(next: boolean) {
    if (!user) return;
    setError(null);
    try {
      await setDriveShared(id, next, user.uid);
      state.reload();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <AsyncView state={state} isEmpty={() => false}>
      {({ booking, meta, files }) => (
        <div className="space-y-4">
          <Card className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div>
              <p className="font-medium text-white">{booking?.eventName ?? "Booking"}</p>
              <p className="text-xs text-[var(--rr-text-tertiary)]">{files.length} files uploaded</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={meta?.isSharedWithCustomer ? "success" : "muted"}>{meta?.isSharedWithCustomer ? "Shared with customer" : "Not shared"}</Badge>
              <Button type="button" className="px-3 py-1.5 text-xs" variant={meta?.isSharedWithCustomer ? "outline" : "primary"} onClick={() => toggle(!meta?.isSharedWithCustomer)}>
                {meta?.isSharedWithCustomer ? "Revoke access" : "Approve & share"}
              </Button>
            </div>
          </Card>
          {error ? <Notice>{error}</Notice> : null}
          {files.length === 0 ? (
            <Empty>The provider has not uploaded any files yet.</Empty>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
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
                      <p className="text-[10px] text-[var(--rr-text-tertiary)]">{fmtDate(toDate(f.uploadedAt))}</p>
                    </div>
                  </Card>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </AsyncView>
  );
}

function Picker() {
  const state = useAsync(() => listAllBookings(200), []);
  return (
    <AsyncView state={state} empty="No bookings yet.">
      {(rows) => (
        <div className="space-y-2">
          {rows.map((b) => (
            <Link key={b.id} href={`/admin-booking-drive?id=${b.id}`}>
              <Card className="mb-2 flex justify-between py-3 text-sm">
                <span className="text-white">{b.eventName}</span>
                <span className="text-[var(--rr-text-tertiary)]">{fmtDate(toDate(b.eventDate))} · #{b.id.slice(0, 8)}</span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AsyncView>
  );
}

export default function Page() {
  const query = useQuery();
  const id = query.get("id");
  return (
    <div>
      <PageHeader title="Booking drive" subtitle="Review footage and release it to the customer" />
      {!query.ready ? null : id ? <DrivePanel id={id} /> : <Picker />}
    </div>
  );
}
