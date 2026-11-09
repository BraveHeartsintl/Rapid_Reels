"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AsyncView } from "@/components/ui/State";
import { saveDraft, useBookingDraft } from "@/lib/booking/draft";
import { listPublicOffers } from "@/lib/data/queries";
import { fmtDate, fmtMoney } from "@/lib/format";
import { useAsync } from "@/lib/hooks";

export default function Page() {
  const router = useRouter();
  const draft = useBookingDraft();
  const state = useAsync(listPublicOffers, []);

  return (
    <div>
      <PageHeader title="Redeem offers" subtitle="Pick a code to apply to your next booking" />
      <AsyncView state={state} empty="There are no active offers right now.">
        {(offers) => (
          <div className="space-y-3">
            {offers.map((o) => {
              const label = o.discount?.percentage
                ? `${o.discount.percentage}% off`
                : o.discount?.amount
                  ? `${fmtMoney(o.discount.amount)} off`
                  : "";
              const active = draft.couponCode?.toUpperCase() === o.code?.toUpperCase();
              return (
                <Card key={o.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{o.title}</p>
                    <p className="text-xs text-[var(--rr-secondary)]">
                      {o.code} {label ? `· ${label}` : ""}
                    </p>
                    {o.description ? <p className="mt-1 text-xs text-[var(--rr-text-tertiary)]">{o.description}</p> : null}
                    {o.expiresAt ? <p className="text-[10px] text-[var(--rr-text-tertiary)]">Valid until {fmtDate(o.expiresAt)}</p> : null}
                  </div>
                  <Button
                    type="button"
                    variant={active ? "secondary" : "outline"}
                    className="shrink-0 px-4 py-2 text-xs"
                    onClick={() => {
                      saveDraft({ couponCode: o.code });
                      router.push("/event-type-selection");
                    }}
                  >
                    {active ? "Selected" : "Use code"}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </AsyncView>
    </div>
  );
}
