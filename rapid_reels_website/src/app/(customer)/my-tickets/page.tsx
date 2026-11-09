"use client";

import { PageHeader } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Badge, Card } from "@/components/ui/Card";
import { AsyncView } from "@/components/ui/State";
import { useUid } from "@/lib/auth/useUid";
import { listUserTickets } from "@/lib/data/queries";
import { fmtDate, titleCase } from "@/lib/format";
import { useAsync } from "@/lib/hooks";

export default function Page() {
  const uid = useUid();
  const state = useAsync(() => listUserTickets(uid!), [uid], Boolean(uid));

  return (
    <div>
      <PageHeader title="My tickets" action={<Button href="/help-support" className="px-4 py-2 text-xs">New</Button>} />
      <AsyncView state={state} empty="You have not raised any support tickets.">
        {(rows) => (
          <div className="space-y-2">
            {rows.map((t) => (
              <Card key={t.id} className="flex justify-between gap-3">
                <div>
                  <p className="text-sm text-white">{t.subject}</p>
                  <p className="text-xs text-[var(--rr-text-tertiary)]">
                    #{t.id.slice(0, 6).toUpperCase()} · {fmtDate(t.createdAt)}
                  </p>
                  {t.description ? <p className="mt-1 text-xs text-[var(--rr-text-secondary)]">{t.description}</p> : null}
                </div>
                <Badge tone={t.status === "open" ? "warning" : t.status === "resolved" || t.status === "closed" ? "success" : "primary"}>
                  {titleCase(t.status)}
                </Badge>
              </Card>
            ))}
          </div>
        )}
      </AsyncView>
    </div>
  );
}
