import { cn } from "@/lib/utils";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string };

export function Textarea({ label, className, ...props }: Props) {
  return (
    <label className="flex w-full flex-col gap-1.5 text-sm">
      {label ? (
        <span className="text-sm font-semibold text-[var(--rr-text-secondary)]">{label}</span>
      ) : null}
      <textarea
        rows={4}
        className={cn(
          "w-full rounded-[var(--radius-sm)] border border-[var(--rr-outline)] bg-[var(--rr-surface)] px-4 py-3 text-[var(--rr-text)] outline-none transition duration-200 ease-out placeholder:text-[var(--rr-text-tertiary)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20",
          className,
        )}
        {...props}
      />
    </label>
  );
}
