import Link from "next/link";

const links = [
  ["/provider-business-profile", "Business profile"],
  ["/provider-portfolio-upload", "Portfolio"],
  ["/provider-service-areas", "Service areas"],
  ["/provider-availability-calendar", "Availability"],
  ["/provider-catalogue", "Catalogue"],
  ["/provider-verification", "Verification"],
  ["/provider-document-upload", "Documents"],
  ["/provider-my-reels", "My reels"],
];

export default function Page() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-white">Account</h1>
      <div className="space-y-2">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className="flex justify-between rounded-2xl bg-[var(--rr-card)] px-4 py-3 text-sm text-white">
            {label}<span>→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
