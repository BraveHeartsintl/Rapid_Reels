"use client";

import { PageHeader } from "@/components/layout/FlowScreen";
import { Badge, Card } from "@/components/ui/Card";
import { AsyncView } from "@/components/ui/State";
import { useUid } from "@/lib/auth/useUid";
import { listCustomerPayments } from "@/lib/data/queries";
import { fmtDateTime, fmtMoney, titleCase } from "@/lib/format";
import { useAsync } from "@/lib/hooks";

export default function Page() {
  const uid = useUid();
  const state = useAsync(() => listCustomerPayments(uid!), [uid], Boolean(uid));

  return (
    <div>
      <PageHeader title="Transactions" subtitle="Payments for your bookings" />
      <AsyncView state={state} empty="No payments yet.">
        {(rows) => (
          <div>
            {rows.map((t) => (
              <Card key={t.id} className="mb-2 flex justify-between gap-3 text-sm">
                <div>
                  <p className="text-white">Booking payment</p>
                  <p className="text-xs text-[var(--rr-text-tertiary)]">
                    {fmtDateTime(t.createdAt)} · {titleCase(t.paymentMethodType)}
                  </p>
                  {t.bookingId ? (
                    <a href={`/event-details-view?id=${t.bookingId}`} className="text-xs text-[var(--rr-secondary)]">
                      View event →
                    </a>
                  ) : null}
                </div>
                <div className="text-right">
                  <p className="text-white">{fmtMoney(t.amount, t.currency)}</p>
                  <Badge tone={t.status === "succeeded" ? "success" : t.status === "failed" ? "warning" : "muted"}>
                    {titleCase(t.status)}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </AsyncView>
    </div>
  );
}
