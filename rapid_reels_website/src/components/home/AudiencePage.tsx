import Image from "next/image";
import { CtaBanner } from "@/components/home/CtaBanner";
import { MarketingFooter, MarketingNav } from "@/components/layout/MarketingChrome";
import { Button } from "@/components/ui/Button";

type Cta = { href: string; label: string };

export type AudienceContent = {
  eyebrow: string;
  title: string;
  accent: string;
  intro: string;
  primary: Cta;
  secondary: Cta;
  heroImage: string;
  heroAlt: string;
  stats: { value: string; label: string }[];
  benefitsTitle: string;
  benefits: { icon: string; title: string; text: string }[];
  stepsTitle: string;
  steps: { title: string; text: string }[];
  faqs: { q: string; a: string }[];
};

/** Shared layout for the "For customers" and "For providers" marketing pages. */
export function AudiencePage({ c }: { c: AudienceContent }) {
  return (
    <div className="min-h-screen">
      <MarketingNav />

      {/* Hero */}
      <section className="hero-glow relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 sm:pt-36">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-[var(--rr-accent)] backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--rr-accent)]" />
              {c.eyebrow}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              {c.title} <span className="text-gradient">{c.accent}</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-[var(--rr-text-secondary)]">{c.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={c.primary.href}>{c.primary.label}</Button>
              <Button href={c.secondary.href} variant="outline">
                {c.secondary.label}
              </Button>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm md:max-w-md">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-[var(--rr-primary)]/40 via-[var(--rr-primary-dark)]/20 to-[var(--rr-secondary)]/20 blur-2xl" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-[var(--rr-primary)]/30">
              <Image
                src={c.heroImage}
                alt={c.heroAlt}
                fill
                priority
                sizes="(min-width: 768px) 448px, 90vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
          </div>
        </div>

        <dl className="mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-4">
          {c.stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center backdrop-blur">
              <dt className="sr-only">{s.label}</dt>
              <dd className="text-3xl font-extrabold text-white">{s.value}</dd>
              <p className="mt-1 text-sm text-[var(--rr-text-tertiary)]">{s.label}</p>
            </div>
          ))}
        </dl>
      </section>

      {/* Benefits */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{c.benefitsTitle}</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {c.benefits.map((b) => (
              <div
                key={b.title}
                className="group rounded-3xl border border-[var(--rr-outline)]/60 bg-[var(--rr-card)] p-6 transition duration-200 hover:-translate-y-1 hover:border-[var(--rr-primary)]/60"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--rr-primary)]/15 text-xl transition group-hover:bg-[var(--rr-primary)]">
                  {b.icon}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-white">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--rr-text-secondary)]">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-[var(--rr-surface)] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{c.stepsTitle}</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-4">
            {c.steps.map((s, i) => (
              <li key={s.title} className="relative rounded-3xl border border-[var(--rr-outline)]/60 bg-[var(--rr-card)] p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--rr-gradient)] bg-[var(--rr-primary)] text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--rr-text-secondary)]">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Frequently asked questions</h2>
          <div className="mt-8 divide-y divide-[var(--rr-outline)] border-y border-[var(--rr-outline)]">
            {c.faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left text-base font-semibold text-white marker:hidden [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden className="relative h-5 w-5 shrink-0 text-[var(--rr-secondary)]">
                    <span className="absolute left-0 top-1/2 h-0.5 w-5 -translate-y-1/2 rounded bg-current" />
                    <span className="absolute left-1/2 top-0 h-5 w-0.5 -translate-x-1/2 rounded bg-current transition duration-200 group-open:rotate-90 group-open:opacity-0" />
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[var(--rr-text-secondary)]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
      <MarketingFooter />
    </div>
  );
}
