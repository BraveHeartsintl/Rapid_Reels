/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { cn } from "@/lib/utils";
import { EVENT_TYPES } from "@/lib/format";
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
  const type = EVENT_TYPES.find((e) => e.id === reel.eventType);
  const content = (
    <div
      className={cn(
        "group relative flex aspect-[3/4] items-end overflow-hidden rounded-2xl border border-[var(--rr-outline)]/60 bg-gradient-to-br from-[var(--rr-primary)]/30 to-[var(--rr-card)] transition duration-300 hover:-translate-y-1 hover:border-[var(--rr-primary)]/70 hover:shadow-xl hover:shadow-[var(--rr-primary)]/20",
        className,
      )}
    >
      {reel.thumbnailUrl ? (
        <img
          src={reel.thumbnailUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : null}

      {type ? (
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: type.color }} />
          {type.label}
        </span>
      ) : null}

      <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--rr-primary)] text-xs text-white opacity-0 shadow-lg transition duration-300 group-hover:opacity-100">
        ▶
      </span>

      <div className="relative w-full bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 pt-10">
        <p className="line-clamp-2 text-sm font-semibold text-white">{reel.title || reel.eventName || "Reel"}</p>
        {showStats ? (
          <p className="mt-1 text-[11px] text-white/70">
            ♥ {reel.analytics?.likes ?? 0} · ▶ {reel.analytics?.views ?? 0}
          </p>
        ) : null}
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
