import { cities } from "@/lib/mock";
import Link from "next/link";

export const metadata = { title: "Select city" };

export default function CitySelectionPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-10">
      <h1 className="text-3xl font-semibold text-white">Select your city</h1>
      <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">
        We show providers and venues near you.
      </p>
      <div className="mt-8 grid grid-cols-2 gap-3">
        {cities.map((city) => (
          <Link
            key={city}
            href="/home"
            className="rounded-2xl border border-[var(--rr-outline)]/60 bg-[var(--rr-card)] px-4 py-5 text-center font-medium text-white transition hover:border-[var(--rr-primary)]"
          >
            {city}
          </Link>
        ))}
      </div>
    </div>
  );
}
