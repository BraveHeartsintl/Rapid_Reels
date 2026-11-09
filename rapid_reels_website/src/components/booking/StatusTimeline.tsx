import { toDate, type BookingDoc } from "@/lib/data/types";
import { fmtDateTime } from "@/lib/format";

const STEPS: Array<[string, string]> = [
  ["bookingConfirmed", "Booking confirmed"],
  ["providerAccepted", "Provider accepted"],
  ["eventStarted", "Event started"],
  ["firstReelDelivered", "First reel delivered"],
  ["eventCompleted", "Event completed"],
  ["allReelsDelivered", "All reels delivered"],
];

export function StatusTimeline({ booking }: { booking: BookingDoc }) {
  return (
    <ol className="space-y-4">
      {STEPS.map(([key, label]) => {
        const at = toDate(booking.eventStatus?.[key]);
        return (
          <li key={key} className="flex gap-4">
            <span
              className={
                at
                  ? "mt-1 h-3 w-3 shrink-0 rounded-full bg-[var(--rr-success)]"
                  : "mt-1 h-3 w-3 shrink-0 rounded-full bg-white/15"
              }
            />
            <div>
              <p className={at ? "text-white" : "text-[var(--rr-text-tertiary)]"}>{label}</p>
              <p className="text-xs text-[var(--rr-text-tertiary)]">{at ? fmtDateTime(at) : "Pending"}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
