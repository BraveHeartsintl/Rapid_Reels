"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Empty, Notice } from "@/components/ui/State";
import { useAuth } from "@/lib/auth/AuthProvider";
import { updateUserProfile } from "@/lib/data/queries";
import { errorMessage } from "@/lib/format";

interface SavedAddress {
  addressId: string;
  label: string;
  address: string;
  city: string;
  pincode: string;
  coordinates: { latitude: number; longitude: number };
}

export default function Page() {
  const { user, profile, refreshProfile } = useAuth();
  const saved = ((profile as unknown as { savedAddresses?: SavedAddress[] } | null)?.savedAddresses ?? []) as SavedAddress[];
  const [form, setForm] = useState({ label: "", address: "", city: "", pincode: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function persist(next: SavedAddress[]) {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      await updateUserProfile(user.uid, { savedAddresses: next });
      await refreshProfile();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await persist([
      ...saved,
      {
        addressId: crypto.randomUUID(),
        label: form.label.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        pincode: form.pincode.trim(),
        coordinates: { latitude: 0, longitude: 0 },
      },
    ]);
    setForm({ label: "", address: "", city: "", pincode: "" });
  }

  return (
    <div>
      <PageHeader title="Saved venues" subtitle="Reuse addresses when you book" />
      <div className="space-y-3">
        {saved.length === 0 ? (
          <Empty>No saved venues yet.</Empty>
        ) : (
          saved.map((v) => (
            <Card key={v.addressId} className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">{v.label}</p>
                <p className="text-xs text-[var(--rr-text-tertiary)]">
                  {[v.address, v.city, v.pincode].filter(Boolean).join(", ")}
                </p>
              </div>
              <button
                type="button"
                disabled={busy}
                className="text-xs text-[var(--rr-error)]"
                onClick={() => persist(saved.filter((s) => s.addressId !== v.addressId))}
              >
                Remove
              </button>
            </Card>
          ))
        )}
      </div>
      <form onSubmit={add} className="mt-6 space-y-3">
        <h2 className="text-sm font-semibold text-[var(--rr-text-secondary)]">Add a venue</h2>
        <Input label="Name" placeholder="Home, Office…" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required />
        <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
        <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
        <Input label="Postcode / pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
        {error ? <Notice>{error}</Notice> : null}
        <Button type="submit" className="w-full" disabled={busy}>
          Save venue
        </Button>
      </form>
    </div>
  );
}
