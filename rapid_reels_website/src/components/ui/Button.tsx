import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] hover:shadow-[var(--shadow-glow)]",
  secondary:
    "border-[1.5px] border-white bg-transparent text-white hover:bg-white hover:text-[var(--color-ink)]",
  ghost: "bg-transparent text-[var(--rr-text)] hover:bg-white/10",
  outline:
    "bg-white/5 border border-white/15 text-white backdrop-blur hover:bg-white/10",
  danger: "bg-[var(--rr-error-solid)] text-white hover:brightness-110",
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
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-3 text-sm font-semibold transition pointer-coarse:min-h-11 duration-200 ease-out disabled:cursor-not-allowed disabled:bg-[var(--rr-outline)] disabled:text-[var(--rr-text-tertiary)] disabled:shadow-none disabled:hover:bg-[var(--rr-outline)] disabled:hover:text-[var(--rr-text-tertiary)]",
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
