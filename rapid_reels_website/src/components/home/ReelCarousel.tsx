"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { SectionHeading } from "@/components/home/SectionHeading";

const reels = [
  { src: "/reels/reel-wedding.jpg", title: "Wedding", caption: "First dance" },
  { src: "/reels/reel-birthday.jpg", title: "Birthday", caption: "Cake moment" },
  { src: "/reels/reel-engagement.jpg", title: "Engagement", caption: "Garden party" },
  { src: "/reels/reel-corporate.jpg", title: "Corporate", caption: "Launch night" },
  { src: "/reels/reel-rooftop.jpg", title: "Rooftop", caption: "City lights" },
  { src: "/reels/reel-graduation.jpg", title: "Graduation", caption: "The send-off" },
  { src: "/reels/reel-houseparty.jpg", title: "House party", caption: "Living room" },
  { src: "/reels/reel-festival.jpg", title: "Festival", caption: "Stage lights" },
  { src: "/reels/reel-toast.jpg", title: "Dinner party", caption: "The toast" },
  { src: "/reels/reel-dancefloor.jpg", title: "Dance floor", caption: "Last song" },
];

export function ReelCarousel() {
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const paused = useRef(false);

  function scrollToIndex(index: number) {
    const el = scroller.current;
    if (!el) return;
    const next = (index + reels.length) % reels.length;
    const card = el.children[next] as HTMLElement | undefined;
    if (!card) return;
    el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: "smooth" });
    setActive(next);
  }

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = window.setInterval(() => {
      if (paused.current) return;
      setActive((current) => {
        const next = (current + 1) % reels.length;
        const el = scroller.current;
        const card = el?.children[next] as HTMLElement | undefined;
        if (el && card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: "smooth" });
        return next;
      });
    }, 3200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="overflow-hidden px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Party reels"
            title="Ten nights, one feed"
            description="A look at the kinds of celebrations creators cover, from first dances to last songs."
          />
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous reel"
              onClick={() => scrollToIndex(active - 1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition duration-200 hover:bg-white/10"
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next reel"
              onClick={() => scrollToIndex(active + 1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition duration-200 hover:bg-white/10"
            >
              →
            </button>
          </div>
        </div>

        <div className="relative mt-12">
          <div
            className="rainbow-glow pointer-events-none absolute inset-x-8 -bottom-6 h-16 rounded-full opacity-40 blur-2xl"
            aria-hidden="true"
          />
          <div
            ref={scroller}
            onMouseEnter={() => {
              paused.current = true;
            }}
            onMouseLeave={() => {
              paused.current = false;
            }}
            onFocus={() => {
              paused.current = true;
            }}
            onBlur={() => {
              paused.current = false;
            }}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Event party reels"
          >
            {reels.map((reel, i) => (
              <figure
                key={reel.src}
                className="w-[210px] shrink-0 snap-start sm:w-[240px]"
                aria-current={i === active ? "true" : undefined}
              >
                <div className="rainbow-ring rounded-[1.6rem] p-[3px] shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
                  <div className="relative aspect-[9/16] overflow-hidden rounded-[1.45rem] bg-black">
                    <Image
                      src={reel.src}
                      alt={`${reel.title}: ${reel.caption}`}
                      fill
                      sizes="240px"
                      className="object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                      <figcaption>
                        <p className="text-sm font-semibold text-white">{reel.title}</p>
                        <p className="text-xs text-white/75">{reel.caption}</p>
                      </figcaption>
                    </div>
                  </div>
                </div>
              </figure>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-2" role="tablist" aria-label="Reel slides">
          {reels.map((reel, i) => (
            <button
              key={reel.src}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Show ${reel.title}`}
              onClick={() => scrollToIndex(i)}
              className={
                i === active
                  ? "rainbow-glow h-2 w-8 rounded-full"
                  : "h-2 w-2 rounded-full bg-white/25 transition duration-200 hover:bg-white/50"
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
