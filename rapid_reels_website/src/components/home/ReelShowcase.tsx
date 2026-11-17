import Image from "next/image";
import { SectionHeading } from "@/components/home/SectionHeading";

const moments = [
  { label: "During the event", body: "Your creator is on site and you can follow progress live." },
  { label: "Within minutes", body: "A polished vertical reel lands in your account, ready to review." },
  { label: "Share instantly", body: "Post to Instagram or send on WhatsApp while guests are still celebrating." },
];

export function ReelShowcase() {
  return (
    <section className="bg-[var(--rr-surface)] px-4 py-24 sm:px-6">
      <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="The reel"
            title="Cinematic, vertical, ready to share"
            description="Made for the screen your guests actually watch on."
          />
          <ol className="mt-10 space-y-6">
            {moments.map((m, i) => (
              <li key={m.label} className="flex gap-5 border-l border-[var(--rr-outline)] pl-6">
                <span className="text-sm font-semibold tabular-nums text-[var(--rr-secondary)]">
                  0{i + 1}
                </span>
                <div>
                  <p className="font-semibold text-white">{m.label}</p>
                  <p className="mt-1 text-sm text-[var(--rr-text-secondary)]">{m.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="relative mx-auto w-full max-w-[280px]">
          <div className="absolute -inset-8 rounded-full bg-[var(--color-primary)]/20 blur-3xl" aria-hidden="true" />
          {/* Phone-bezel frame, 9:16 */}
          <div className="relative aspect-[9/16] rounded-[2.5rem] border border-white/15 bg-black p-2.5 shadow-[var(--shadow-raised)]">
            <div className="relative h-full w-full overflow-hidden rounded-[2rem]">
              <Image
                src="/hero-event.jpg"
                alt="A reel preview of a celebration filmed by a creator"
                fill
                sizes="280px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
              <span className="absolute left-1/2 top-3 h-1.5 w-16 -translate-x-1/2 rounded-full bg-black/70" />
              <div className="absolute inset-x-4 bottom-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--rr-secondary)]">
                  Reel ready
                </p>
                <p className="mt-1 text-sm font-semibold text-white">Your highlights are in</p>
                <span className="mt-3 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-[var(--shadow-glow)]">
                  ▶
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
