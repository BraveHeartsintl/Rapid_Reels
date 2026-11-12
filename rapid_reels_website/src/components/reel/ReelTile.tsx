/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReelDoc, WithId } from "@/lib/data/types";

export function ReelTile({
  reel,
  href,
  className,
  showStats,
}: {
  reel: WithId<ReelDoc>;
  href?: string;
  className?: string;
  showStats?: boolean;
}) {
  const content = (
    <div
      className={cn(
        "relative flex aspect-[3/4] items-end overflow-hidden rounded-2xl border border-[var(--rr-outline)]/60 bg-gradient-to-br from-[var(--rr-primary)]/30 to-[var(--rr-card)]",
        className,
      )}
    >
      {reel.thumbnailUrl ? (
        <img src={reel.thumbnailUrl} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
      <div className="relative w-full bg-gradient-to-t from-black/80 to-transparent p-3">
        <p className="line-clamp-2 text-xs font-medium text-white">{reel.title || reel.eventName || "Reel"}</p>
        {showStats ? (
          <p className="mt-0.5 text-[10px] text-white/70">
            ♥ {reel.analytics?.likes ?? 0} · ▶ {reel.analytics?.views ?? 0}
          </p>
        ) : null}
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
