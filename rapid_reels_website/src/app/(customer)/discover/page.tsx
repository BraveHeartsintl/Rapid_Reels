"use client";

import { useMemo, useState } from "react";
import { ReelTile } from "@/components/reel/ReelTile";
import { AsyncView } from "@/components/ui/State";
import { listDiscoverReels } from "@/lib/data/queries";
import { EVENT_TYPES } from "@/lib/format";
import { useAsync, useQuery } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export default function DiscoverPage() {
  const query = useQuery();
  if (!query.ready) return null;

  const requested = query.get("type");
  const initial = EVENT_TYPES.some((e) => e.id === requested) ? (requested as string) : undefined;
  return <Discover initialType={initial} />;
}

function Discover({ initialType }: { initialType?: string }) {
  const [type, setType] = useState<string | undefined>(initialType);
  const [search, setSearch] = useState("");
  const state = useAsync(() => listDiscoverReels(40, type), [type]);

  const activeLabel = EVENT_TYPES.find((e) => e.id === type)?.label;
  const term = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    const rows = state.data ?? [];
    if (!term) return rows;
    return rows.filter((r) =>
      [r.title, r.eventName, r.description, ...(r.tags ?? []), ...(r.hashtags ?? [])]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term)),
    );
  }, [state.data, term]);

  const chip = (id: string | undefined, label: string, color?: string) => {
    const on = type === id;
    return (
      <button
        key={label}
        type="button"
        onClick={() => setType(id)}
        aria-pressed={on}
        className={cn(
          "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition duration-200",
          on
            ? "border-transparent bg-[var(--rr-primary)] text-white shadow-lg shadow-[var(--rr-primary)]/30"
            : "border-white/10 bg-white/5 text-[var(--rr-text-secondary)] hover:border-white/25 hover:text-white",
        )}
      >
        {color ? <span className="h-2 w-2 rounded-full" style={{ background: color }} /> : null}
        {label}
      </button>
    );
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[var(--rr-primary)]/25 via-[#7a1fa2]/20 to-[var(--rr-surface)] px-6 py-8 sm:px-10 sm:py-10">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[var(--rr-primary)]/25 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {activeLabel ? (
              <>
                <span className="text-gradient">{activeLabel}</span> reels
              </>
            ) : (
              <>
                Discover <span className="text-gradient">event reels</span>
              </>
            )}
          </h1>
          <p className="mt-2 max-w-xl text-[var(--rr-text-secondary)]">
            Watch trending reels from real events and find the style you want for yours.
          </p>
          <div className="relative mt-6 max-w-xl">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--rr-text-tertiary)]" aria-hidden>
              ⌕
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reels by title, tag or event…"
              aria-label="Search reels"
              className="h-12 w-full rounded-full border border-white/10 bg-black/30 pl-11 pr-5 text-sm text-white outline-none backdrop-blur transition placeholder:text-[var(--rr-text-tertiary)] focus:border-[var(--rr-primary)] focus:ring-4 focus:ring-[var(--rr-primary)]/20"
            />
          </div>
        </div>
      </section>

      {/* Category chips */}
      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {chip(undefined, "All")}
        {EVENT_TYPES.map((e) => chip(e.id, e.label, e.color))}
      </div>

      <AsyncView state={state} empty="No reels have been published for this category yet.">
        {() =>
          filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--rr-outline)] py-14 text-center">
              <p className="text-3xl">🎬</p>
              <p className="mt-3 font-medium text-white">No reels match “{search}”</p>
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-3 text-sm text-[var(--rr-secondary)] hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-[var(--rr-text-tertiary)]">
                {filtered.length} reel{filtered.length === 1 ? "" : "s"}
                {activeLabel ? ` in ${activeLabel}` : ""}
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filtered.map((r) => (
                  <ReelTile key={r.id} reel={r} href={`/reel-player?id=${r.id}`} showStats />
                ))}
              </div>
            </>
          )
        }
      </AsyncView>
    </div>
  );
}
