import { SectionHeading } from "@/components/home/SectionHeading";

type Feature = { title: string; body: string; icon: React.ReactNode };

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const features: Feature[] = [
  {
    title: "Verified creators",
    body: "Every provider is checked before they appear, so you book with confidence.",
    icon: (
      <Icon>
        <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </Icon>
    ),
  },
  {
    title: "Live event tracking",
    body: "Follow coverage as it happens, from arrival to the final frame.",
    icon: (
      <Icon>
        <circle cx="12" cy="12" r="3" />
        <path d="M6.3 6.3a8 8 0 000 11.4M17.7 6.3a8 8 0 010 11.4" />
      </Icon>
    ),
  },
  {
    title: "Same-day reels",
    body: "Highlights delivered fast, while the moment is still worth sharing.",
    icon: (
      <Icon>
        <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
      </Icon>
    ),
  },
  {
    title: "Secure checkout",
    body: "Pay in one clear step with transparent packages and no surprises.",
    icon: (
      <Icon>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 018 0v3" />
      </Icon>
    ),
  },
  {
    title: "Wallet and rewards",
    body: "Earn credit through referrals and put it toward your next celebration.",
    icon: (
      <Icon>
        <rect x="3" y="6" width="18" height="14" rx="2" />
        <path d="M3 10h18M16 15h2" />
      </Icon>
    ),
  },
  {
    title: "Discover feed",
    body: "Browse public event reels to find the style and creator that fits you.",
    icon: (
      <Icon>
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <path d="M10 9l5 3-5 3V9z" />
      </Icon>
    ),
  },
];

export function FeatureTiles() {
  return (
    <section className="border-t border-[var(--rr-outline)]/40 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="The difference"
          title="Crafted for moments that matter"
          description="A refined way to book, follow and share your event, with every detail handled."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <article
              key={f.title}
              className="group rounded-[var(--radius-md)] border border-[var(--rr-outline)]/60 bg-gradient-to-b from-[var(--rr-card)] to-[var(--rr-surface)] p-7 transition duration-200 ease-out hover:-translate-y-1 hover:border-[var(--color-primary)]/50 hover:shadow-[var(--shadow-raised)]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-primary)]/15 text-[var(--rr-secondary)] transition duration-200 group-hover:bg-[var(--color-primary)] group-hover:text-white">
                {f.icon}
              </span>
              <h3 className="mt-6 text-xl font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--rr-text-secondary)]">{f.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
