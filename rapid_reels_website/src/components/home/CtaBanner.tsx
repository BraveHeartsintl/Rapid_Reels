import Link from "next/link";

export function CtaBanner() {
  return (
    <section className="bg-[var(--color-primary)] px-4 py-20 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div className="max-w-xl">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Book a creator. Get your reel fast.</h2>
          <p className="mt-3 text-base font-medium text-white/90">
            Your next celebration deserves more than a camera roll.
          </p>
        </div>
        <Link
          href="/role-selection"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-white px-8 py-3 text-base font-semibold text-[var(--color-primary)] transition duration-200 ease-out hover:shadow-[var(--shadow-raised)] pointer-coarse:min-h-11"
        >
          Get started
        </Link>
      </div>
    </section>
  );
}
