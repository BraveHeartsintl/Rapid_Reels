import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--rr-secondary)]">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">{title}</h2>
      {description ? (
        <p className="mt-4 text-base text-[var(--rr-text-secondary)] sm:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
