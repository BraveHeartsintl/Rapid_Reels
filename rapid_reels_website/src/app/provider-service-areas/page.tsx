"use client";

import { useState } from "react";
import { FlowScreen } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AsyncView, Notice } from "@/components/ui/State";
import { useProviderDoc } from "@/lib/auth/useProviderDoc";
import { updateProvider } from "@/lib/data/queries";
import type { ProviderDoc } from "@/lib/data/types";
import { errorMessage } from "@/lib/format";

function AreasForm({ uid, provider }: { uid: string; provider: ProviderDoc }) {
  const loc = provider.location ?? {};
  const [areas, setAreas] = useState<string[]>(provider.serviceAreas ?? []);
  const [draft, setDraft] = useState("");
  const [radius, setRadius] = useState(String(provider.serviceRadius ?? 25));
  const [address, setAddress] = useState(loc.address ?? "");
  const [city, setCity] = useState(loc.city ?? "");
  const [state, setState] = useState(loc.state ?? "");
  const [pincode, setPincode] = useState(loc.pincode ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  function addArea() {
    const v = draft.trim();
    if (v && !areas.some((a) => a.toLowerCase() === v.toLowerCase())) setAreas((l) => [...l, v]);
    setDraft("");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await updateProvider(uid, {
        serviceAreas: areas,
        serviceRadius: Number(radius) || 0,
        "location.address": address.trim(),
        "location.city": city.trim(),
        "location.state": state.trim(),
        "location.pincode": pincode.trim(),
      });
      setMsg({ tone: "success", text: "Service areas saved." });
    } catch (err) {
      setMsg({ tone: "error", text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div>
        <p className="mb-2 text-sm text-[var(--rr-text-secondary)]">Cities and areas you cover</p>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. Manchester"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addArea();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addArea}>Add</Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {areas.map((a) => (
            <button key={a} type="button" onClick={() => setAreas((l) => l.filter((x) => x !== a))} className="rounded-full bg-[var(--rr-card)] px-3 py-1 text-xs text-white">
              {a} ✕
            </button>
          ))}
        </div>
      </div>
      <Input label="Travel radius (miles)" type="number" min={0} value={radius} onChange={(e) => setRadius(e.target.value)} />
      <h2 className="pt-2 text-sm font-semibold text-[var(--rr-text-secondary)]">Base location</h2>
      <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
        <Input label="County / state" value={state} onChange={(e) => setState(e.target.value)} />
      </div>
      <Input label="Postcode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
      <Button type="submit" className="w-full" disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
    </form>
  );
}

export default function Page() {
  const state = useProviderDoc();
  return (
    <FlowScreen title="Service areas" subtitle="Where you can shoot events" backHref="/provider-dashboard">
      <AsyncView state={state} empty="Provider profile not found." isEmpty={(d) => !d}>
        {(p) => <AreasForm uid={state.uid!} provider={p} />}
      </AsyncView>
    </FlowScreen>
  );
}
