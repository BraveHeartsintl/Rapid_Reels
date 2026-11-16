import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--rr-primary)] bg-[image:var(--rr-gradient)] text-white hover:brightness-110 shadow-[0_8px_24px_rgba(178,63,240,0.4)]",
  secondary:
    "bg-[var(--rr-secondary)] text-[#07040D] hover:brightness-110 font-semibold",
  ghost: "bg-transparent text-[var(--rr-text)] hover:bg-white/5",
  outline:
    "bg-transparent border border-[var(--rr-primary)] text-[#f0d4ff] hover:bg-[var(--rr-primary)]/20",
  danger: "bg-[var(--rr-error)] text-white hover:brightness-110",
};

type Common = {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
};

type AsButton = Common &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type AsLink = Common & { href: string; className?: string };

export function Button({
  children,
  className,
  variant = "primary",
  href,
  ...rest
}: AsButton | AsLink) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold transition duration-200",
    variants[variant],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
