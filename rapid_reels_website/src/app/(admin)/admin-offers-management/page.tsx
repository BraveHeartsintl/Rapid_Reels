"use client";

import { Timestamp } from "firebase/firestore";
import { useState } from "react";
import { PageHeader } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Badge, Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { AsyncView, Notice } from "@/components/ui/State";
import { deleteOffer, listAllOffers, saveOffer } from "@/lib/data/queries";
import { toDate, type OfferDoc, type WithId } from "@/lib/data/types";
import { dateKeyLocal, errorMessage, fmtDate } from "@/lib/format";
import { useAsync } from "@/lib/hooks";

function OfferForm({ offer, onDone, onCancel }: { offer: WithId<OfferDoc> | null; onDone: () => void; onCancel: () => void }) {
  const [code, setCode] = useState(offer?.code ?? "");
  const [title, setTitle] = useState(offer?.title ?? "");
  const [description, setDescription] = useState(offer?.description ?? "");
  const [kind, setKind] = useState<"percentage" | "amount">(offer?.discount?.amount ? "amount" : "percentage");
  const [value, setValue] = useState(String(offer?.discount?.amount ?? offer?.discount?.percentage ?? 10));
  const [maxDiscount, setMaxDiscount] = useState(String(offer?.discount?.maxDiscount ?? ""));
  const [maxUses, setMaxUses] = useState(String(offer?.maxUses ?? 0));
  const [start, setStart] = useState(offer?.validity?.startDate ? dateKeyLocal(toDate(offer.validity.startDate)!) : "");
  const [end, setEnd] = useState((offer?.validity?.endDate ?? offer?.expiresAt) ? dateKeyLocal(toDate(offer?.validity?.endDate ?? offer?.expiresAt)!) : "");
  const [isActive, setActive] = useState(offer?.isActive ?? true);
  const [isPublic, setPublic] = useState(offer?.isPublic ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ts = (s: string, endOfDay = false) => {
    if (!s) return null;
    const [y, m, d] = s.split("-").map(Number);
    return Timestamp.fromDate(new Date(y, m - 1, d, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const n = Number(value);
      await saveOffer(offer?.id ?? null, {
        code: code.trim().toUpperCase(),
        title: title.trim(),
        description: description.trim() || null,
        type: kind === "percentage" ? "percentage" : "fixed",
        discount: {
          percentage: kind === "percentage" ? n : null,
          amount: kind === "amount" ? n : null,
          maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        },
        validity: { startDate: ts(start), endDate: ts(end, true) },
        expiresAt: ts(end, true),
        maxUses: Number(maxUses) || 0,
        isActive,
        isPublic,
      });
      onDone();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <Card className="mb-6">
      <form onSubmit={submit} className="space-y-3">
        <h2 className="text-sm font-semibold text-white">{offer ? "Edit offer" : "New offer"}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Coupon code" value={code} onChange={(e) => setCode(e.target.value)} required />
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <Input label="Description" value={description ?? ""} onChange={(e) => setDescription(e.target.value)} />
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-[var(--rr-text-secondary)]">Discount type</span>
            <select value={kind} onChange={(e) => setKind(e.target.value as "percentage" | "amount")} className="rounded-2xl border border-[var(--rr-outline)] bg-[var(--rr-surface)] px-4 py-3 text-white">
              <option value="percentage">Percentage (%)</option>
              <option value="amount">Fixed amount (£)</option>
            </select>
          </label>
          <Input label={kind === "percentage" ? "Percent off" : "Amount off (£)"} type="number" min={0} value={value} onChange={(e) => setValue(e.target.value)} required />
          <Input label="Max discount (£)" type="number" min={0} value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Starts" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          <Input label="Ends" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          <Input label="Max uses (0 = unlimited)" type="number" min={0} value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
        </div>
        <div className="flex gap-6 text-sm text-white">
          <label className="flex items-center gap-2"><input type="checkbox" className="accent-[var(--rr-primary)]" checked={isActive} onChange={(e) => setActive(e.target.checked)} /> Active</label>
          <label className="flex items-center gap-2"><input type="checkbox" className="accent-[var(--rr-primary)]" checked={isPublic} onChange={(e) => setPublic(e.target.checked)} /> Public</label>
        </div>
        {error ? <Notice>{error}</Notice> : null}
        <div className="flex gap-2">
          <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save offer"}</Button>
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}

export default function Page() {
  const state = useAsync(listAllOffers, []);
  const [editing, setEditing] = useState<WithId<OfferDoc> | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function remove(id: string) {
    if (!window.confirm("Delete this offer?")) return;
    try {
      await deleteOffer(id);
      state.reload();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <div>
      <PageHeader
        title="Offers management"
        subtitle="Coupons customers can apply at checkout"
        action={editing ? undefined : <Button type="button" onClick={() => setEditing("new")}>New offer</Button>}
      />
      {editing ? (
        <OfferForm
          key={editing === "new" ? "new" : editing.id}
          offer={editing === "new" ? null : editing}
          onCancel={() => setEditing(null)}
          onDone={() => {
            setEditing(null);
            state.reload();
          }}
        />
      ) : null}
      {error ? <Notice>{error}</Notice> : null}
      <AsyncView state={state} empty="No offers yet.">
        {(rows) => (
          <div className="space-y-2">
            {rows.map((o) => {
              const d = o.discount;
              const label = d?.percentage ? `${d.percentage}% off` : d?.amount ? `£${d.amount} off` : "—";
              return (
                <Card key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-medium text-white">{o.code} <span className="font-normal text-[var(--rr-text-tertiary)]">· {o.title}</span></p>
                    <p className="text-xs text-[var(--rr-text-tertiary)]">
                      {label} · used {o.usedCount ?? 0}{o.maxUses ? `/${o.maxUses}` : ""} · ends {fmtDate(toDate(o.validity?.endDate ?? o.expiresAt))}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={o.isActive ? "success" : "muted"}>{o.isActive ? "Active" : "Inactive"}</Badge>
                    {o.isPublic ? null : <Badge tone="muted">Hidden</Badge>}
                    <button type="button" className="text-xs text-[var(--rr-secondary)]" onClick={() => setEditing(o)}>Edit</button>
                    <button type="button" className="text-xs text-[var(--rr-error)]" onClick={() => remove(o.id)}>Delete</button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </AsyncView>
    </div>
  );
}
