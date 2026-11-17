import { cn } from "@/lib/utils";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className, id, ...props }: Props) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="flex w-full flex-col gap-1.5 text-sm">
      {label ? (
        <span className="text-sm font-semibold text-[var(--rr-text-secondary)]">{label}</span>
      ) : null}
      <input
        id={inputId}
        className={cn(
          "h-12 w-full rounded-[var(--radius-sm)] border border-[var(--rr-outline)] bg-[var(--rr-surface)] px-4 text-[var(--rr-text)] outline-none transition duration-200 ease-out placeholder:text-[var(--rr-text-tertiary)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20",
          className,
        )}
        {...props}
      />
    </label>
  );
}
