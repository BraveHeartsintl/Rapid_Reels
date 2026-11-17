import { SectionHeading } from "@/components/home/SectionHeading";

const faqs = [
  {
    q: "How do I book a creator?",
    a: "Choose your event type and package, pick a verified provider in your city, then pay securely to confirm.",
  },
  {
    q: "Can I follow the event while it is happening?",
    a: "Yes. Live event tracking lets you see progress as your creator covers the day.",
  },
  {
    q: "How quickly will I receive my reel?",
    a: "Reels are delivered quickly so you can share them while the moment is still fresh. Timing depends on your package.",
  },
  {
    q: "Are the providers verified?",
    a: "Providers go through verification before they can accept bookings, and you can read reviews and portfolios first.",
  },
  {
    q: "Where can I see pricing?",
    a: "Packages and pricing are shown clearly before you commit, and you can customize after choosing a tier.",
  },
];

export function FaqAccordion() {
  return (
    <section className="bg-[var(--rr-surface)] px-4 py-24 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-14 md:grid-cols-[1fr_1.4fr]">
        <SectionHeading
          eyebrow="Questions"
          title="Everything you need to know"
          description="Can't find an answer? Reach us any time from the contact page."
        />
        <div className="divide-y divide-[var(--rr-outline)] border-y border-[var(--rr-outline)]">
          {faqs.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left text-base font-semibold text-white marker:hidden [&::-webkit-details-marker]:hidden">
                {f.q}
                <span
                  aria-hidden="true"
                  className="relative h-5 w-5 shrink-0 text-[var(--rr-secondary)]"
                >
                  <span className="absolute left-0 top-1/2 h-0.5 w-5 -translate-y-1/2 rounded bg-current" />
                  <span className="absolute left-1/2 top-0 h-5 w-0.5 -translate-x-1/2 rounded bg-current transition duration-200 ease-out group-open:rotate-90 group-open:opacity-0" />
                </span>
              </summary>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--rr-text-secondary)]">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
