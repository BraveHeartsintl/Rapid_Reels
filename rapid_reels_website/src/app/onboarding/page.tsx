import { Button } from "@/components/ui/Button";

export const metadata = { title: "Onboarding" };

const slides = [
  { title: "Book event creators", body: "Verified videographers for weddings, birthdays, and more." },
  { title: "Reels in minutes", body: "Live coverage with social-ready cuts while the party continues." },
  { title: "Discover & share", body: "Browse the feed, like, comment, and share your moments." },
];

export default function OnboardingPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-between bg-[var(--rr-bg)] px-6 py-10">
      <div className="space-y-8 pt-10">
        {slides.map((s, i) => (
          <div key={s.title} className="animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
            <p className="text-xs font-medium text-[var(--rr-secondary)]">Step {i + 1}</p>
            <h2 className="mt-1 text-xl font-semibold text-white">{s.title}</h2>
            <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">{s.body}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <Button href="/role-selection">Continue</Button>
        <Button href="/login" variant="ghost">
          Skip to sign in
        </Button>
      </div>
    </div>
  );
}
