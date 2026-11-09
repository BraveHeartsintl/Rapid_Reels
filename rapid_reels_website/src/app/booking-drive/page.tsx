"use client";

/* eslint-disable @next/next/no-img-element */
import { PageHeader } from "@/components/layout/FlowScreen";
import { Badge, Card } from "@/components/ui/Card";
import { AsyncView, Empty } from "@/components/ui/State";
import { getDriveMeta, listDriveFiles } from "@/lib/data/queries";
import { toDate } from "@/lib/data/types";
import { fmtDate } from "@/lib/format";
import { useAsync, useQuery } from "@/lib/hooks";

export default function Page() {
  const query = useQuery();
  const id = query.get("id");
  const state = useAsync(
    async () => {
      // Rules deny customers until the drive is shared, so a denied read means "not shared yet".
      const meta = await getDriveMeta(id!).catch(() => null);
      if (!meta?.isSharedWithCustomer) return { shared: false as const, files: [] };
      return { shared: true as const, files: await listDriveFiles(id!) };
    },
    [id],
    query.ready && Boolean(id),
  );

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 py-6">
      <PageHeader title="Booking drive" subtitle="Photos and videos shared by your provider" />
      {query.ready && !id ? (
        <Empty>No booking selected.</Empty>
      ) : (
        <AsyncView state={state} isEmpty={() => false}>
          {(data) =>
            !data.shared ? (
              <Empty>Your drive will appear here once the Rapid Reels team approves and shares it.</Empty>
            ) : data.files.length === 0 ? (
              <Empty>No files have been shared yet.</Empty>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {data.files.map((f) => (
                  <a key={f.id} href={f.downloadUrl} target="_blank" rel="noreferrer">
                    <Card className="overflow-hidden p-0">
                      {f.mimeType?.startsWith("image/") && f.downloadUrl ? (
                        <img src={f.downloadUrl} alt={f.fileName} className="aspect-square w-full object-cover" />
                      ) : (
                        <div className="flex aspect-square items-center justify-center bg-white/5 text-2xl">▶</div>
                      )}
                      <div className="p-2">
                        <p className="truncate text-xs text-white">{f.fileName}</p>
                        <div className="mt-1 flex items-center justify-between">
                          <Badge tone={f.folderType === "edited" ? "success" : "muted"}>{f.folderType}</Badge>
                          <span className="text-[10px] text-[var(--rr-text-tertiary)]">{fmtDate(toDate(f.uploadedAt))}</span>
                        </div>
                      </div>
                    </Card>
                  </a>
                ))}
              </div>
            )
          }
        </AsyncView>
      )}
    </div>
  );
}
