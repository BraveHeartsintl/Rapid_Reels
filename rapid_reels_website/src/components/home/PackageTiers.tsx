import { SectionHeading } from "@/components/home/SectionHeading";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Basic",
    tagline: "The essentials, beautifully done.",
    features: ["Verified provider", "Edited highlight reel", "Delivery to your account"],
    popular: false,
  },
  {
    name: "Standard",
    tagline: "More coverage for bigger occasions.",
    features: ["Everything in Basic", "Expanded coverage options", "Customizable add-ons"],
    popular: true,
  },
  {
    name: "Premium Live",
    tagline: "Follow every moment as it unfolds.",
    features: ["Everything in Standard", "Live event tracking", "Priority delivery"],
    popular: false,
  },
];

function Check() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 shrink-0 text-[var(--color-primary)]"
      aria-hidden="true"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function PackageTiers() {
  return (
    <section className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          align="center"
          eyebrow="Packages"
          title="Choose your level of coverage"
          description="Three tiers, set by verified providers. Exact inclusions and pricing are shown before you book."
        />
        <div className="mt-14 grid items-stretch gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <article
              key={t.name}
              className={cn(
                "relative flex flex-col rounded-[var(--radius-md)] border bg-[var(--rr-card)] p-8 shadow-[var(--shadow-card)]",
                t.popular
                  ? "border-[var(--color-primary)] shadow-[var(--shadow-glow)] md:-translate-y-3"
                  : "border-[var(--rr-outline)]/60",
              )}
            >
              {t.popular ? (
                <span className="absolute -top-3 left-8 rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                  Popular
                </span>
              ) : null}
              <h3 className="text-2xl font-bold text-white">{t.name}</h3>
              <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">{t.tagline}</p>
              <ul className="my-8 flex-1 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-3 text-sm text-[var(--rr-text-secondary)]">
                    <Check />
                    {f}
                  </li>
                ))}
              </ul>
              <Button href="/packages" variant={t.popular ? "primary" : "secondary"} className="w-full">
                View {t.name}
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
