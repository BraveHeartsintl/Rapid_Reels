import Link from "next/link";
import { Badge, Card } from "@/components/ui/Card";
import { fmtDate, fmtMoney, titleCase } from "@/lib/format";
import type { BookingDoc, WithId } from "@/lib/data/types";

export function statusTone(status: string | undefined): "success" | "warning" | "primary" | "muted" {
  switch (status) {
    case "completed":
      return "success";
    case "ongoing":
      return "warning";
    case "cancelled":
      return "muted";
    default:
      return "primary";
  }
}

export function statusLabel(status: string | undefined): string {
  return titleCase(status || "pending");
}

export function BookingCard({
  booking,
  href,
  extra,
}: {
  booking: WithId<BookingDoc>;
  href: string;
  extra?: string;
}) {
  const pay = booking.payment;
  return (
    <Link href={href}>
      <Card className="mb-3 transition hover:border-[var(--rr-primary)]">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-white">{booking.eventName || "Event"}</p>
            <p className="mt-1 text-xs text-[var(--rr-text-tertiary)]">
              {titleCase(booking.eventType)} · {fmtDate(booking.eventDate)}
              {booking.venue?.name ? ` · ${booking.venue.name}` : ""}
            </p>
            {pay?.totalAmount ? (
              <p className="mt-0.5 text-xs text-[var(--rr-text-secondary)]">
                {fmtMoney(pay.totalAmount, pay.currency)}
                {extra ? ` · ${extra}` : ""}
              </p>
            ) : extra ? (
              <p className="mt-0.5 text-xs text-[var(--rr-text-secondary)]">{extra}</p>
            ) : null}
          </div>
          <Badge tone={statusTone(booking.status)}>{statusLabel(booking.status)}</Badge>
        </div>
      </Card>
    </Link>
  );
}
