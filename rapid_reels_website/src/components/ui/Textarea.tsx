import { cn } from "@/lib/utils";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string };

export function Textarea({ label, className, ...props }: Props) {
  return (
    <label className="flex w-full flex-col gap-1.5 text-sm">
      {label ? <span className="text-[var(--rr-text-secondary)]">{label}</span> : null}
      <textarea
        rows={4}
        className={cn(
          "w-full rounded-2xl border border-[var(--rr-outline)] bg-[var(--rr-surface)] px-4 py-3 text-[var(--rr-text)] outline-none transition placeholder:text-[var(--rr-text-tertiary)] focus:border-[var(--rr-primary)] focus:ring-2 focus:ring-[var(--rr-primary)]/30",
          className,
        )}
        {...props}
      />
    </label>
  );
}
