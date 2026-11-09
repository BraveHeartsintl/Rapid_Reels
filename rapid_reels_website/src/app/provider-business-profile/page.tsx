"use client";

import { useState } from "react";
import { FlowScreen } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { AsyncView, Notice } from "@/components/ui/State";
import { Textarea } from "@/components/ui/Textarea";
import { useProviderDoc } from "@/lib/auth/useProviderDoc";
import { updateProvider } from "@/lib/data/queries";
import { safeFileName, uploadFile } from "@/lib/data/storage";
import type { PackageOffering, ProviderDoc } from "@/lib/data/types";
import { errorMessage, EVENT_TYPES } from "@/lib/format";
import { cn } from "@/lib/utils";

const NEW_PACKAGE = (): PackageOffering => ({
  packageId: `pkg_${Date.now().toString(36)}`,
  name: "",
  price: 0,
  duration: 4,
  reelsCount: 1,
  editingStyle: "standard",
  deliveryTime: 3,
  highlightVideo: false,
  liveReelStation: false,
  features: [],
});

function ProfileForm({ uid, provider }: { uid: string; provider: ProviderDoc }) {
  const [businessName, setBusinessName] = useState(provider.businessName ?? "");
  const [ownerName, setOwnerName] = useState(provider.ownerName ?? "");
  const [email, setEmail] = useState(provider.email ?? "");
  const [bio, setBio] = useState(provider.bio ?? "");
  const [teamSize, setTeamSize] = useState(String(provider.teamSize ?? 1));
  const [equipment, setEquipment] = useState((provider.equipment ?? []).join(", "));
  const [eventTypes, setEventTypes] = useState<string[]>(provider.eventTypes ?? []);
  const [packages, setPackages] = useState<PackageOffering[]>(provider.packages ?? []);
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  function patchPackage(i: number, patch: Partial<PackageOffering>) {
    setPackages((list) => list.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const patch: Record<string, unknown> = {
        businessName: businessName.trim(),
        ownerName: ownerName.trim(),
        email: email.trim(),
        bio: bio.trim(),
        teamSize: Number(teamSize) || 1,
        equipment: equipment.split(",").map((s) => s.trim()).filter(Boolean),
        eventTypes,
        packages: packages
          .filter((p) => p.name.trim())
          .map((p) => ({ ...p, name: p.name.trim(), features: p.features.filter(Boolean) })),
      };
      if (photo) {
        const up = await uploadFile(`providers/${uid}/profile/${safeFileName(photo.name)}`, photo);
        patch.profileImage = up.url;
      }
      await updateProvider(uid, patch);
      setMsg({ tone: "success", text: "Profile saved." });
    } catch (err) {
      setMsg({ tone: "error", text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <Input label="Business name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
      <Input label="Owner name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
      <Input label="Business email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Textarea label="About your studio" value={bio} onChange={(e) => setBio(e.target.value)} />
      <Input label="Team size" type="number" min={1} value={teamSize} onChange={(e) => setTeamSize(e.target.value)} />
      <Input label="Equipment (comma separated)" value={equipment} onChange={(e) => setEquipment(e.target.value)} />
      <label className="block rounded-2xl border border-dashed border-[var(--rr-outline)] bg-[var(--rr-surface)] p-5 text-center text-sm text-[var(--rr-text-tertiary)]">
        {photo ? photo.name : provider.profileImage ? "Replace profile photo" : "Upload profile photo"}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
      </label>

      <div>
        <p className="mb-2 text-sm text-[var(--rr-text-secondary)]">Event types you cover</p>
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPES.map((t) => {
            const on = eventTypes.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setEventTypes((l) => (on ? l.filter((x) => x !== t.id) : [...l, t.id]))}
                className={cn("rounded-full px-3 py-1 text-xs", on ? "bg-[var(--rr-primary)] text-white" : "bg-[var(--rr-card)] text-[var(--rr-text-tertiary)]")}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--rr-text-secondary)]">Packages</h2>
          <Button type="button" variant="outline" className="px-3 py-1.5 text-xs" onClick={() => setPackages((l) => [...l, NEW_PACKAGE()])}>Add package</Button>
        </div>
        {packages.length === 0 ? <p className="text-xs text-[var(--rr-text-tertiary)]">No packages yet. Customers pick from your packages when booking.</p> : null}
        {packages.map((p, i) => (
          <Card key={p.packageId} className="space-y-3">
            <Input label="Package name" value={p.name} onChange={(e) => patchPackage(i, { name: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Price (£)" type="number" min={0} value={p.price} onChange={(e) => patchPackage(i, { price: Number(e.target.value) })} />
              <Input label="Reels" type="number" min={1} value={p.reelsCount} onChange={(e) => patchPackage(i, { reelsCount: Number(e.target.value) })} />
              <Input label="Coverage (hours)" type="number" min={1} value={p.duration} onChange={(e) => patchPackage(i, { duration: Number(e.target.value) })} />
              <Input label="Delivery (days)" type="number" min={1} value={p.deliveryTime} onChange={(e) => patchPackage(i, { deliveryTime: Number(e.target.value) })} />
            </div>
            <Input label="Editing style" value={p.editingStyle} onChange={(e) => patchPackage(i, { editingStyle: e.target.value })} />
            <Input label="Features (comma separated)" value={p.features.join(", ")} onChange={(e) => patchPackage(i, { features: e.target.value.split(",").map((s) => s.trim()) })} />
            <div className="flex flex-wrap gap-4 text-sm text-white">
              <label className="flex items-center gap-2"><input type="checkbox" className="accent-[var(--rr-primary)]" checked={Boolean(p.highlightVideo)} onChange={(e) => patchPackage(i, { highlightVideo: e.target.checked })} /> Highlight video</label>
              <label className="flex items-center gap-2"><input type="checkbox" className="accent-[var(--rr-primary)]" checked={Boolean(p.liveReelStation)} onChange={(e) => patchPackage(i, { liveReelStation: e.target.checked })} /> Live reel station</label>
            </div>
            <button type="button" className="text-xs text-[var(--rr-error)]" onClick={() => setPackages((l) => l.filter((_, idx) => idx !== i))}>Remove package</button>
          </Card>
        ))}
      </section>

      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
      <Button type="submit" className="w-full" disabled={busy}>{busy ? "Saving…" : "Save profile"}</Button>
    </form>
  );
}

export default function Page() {
  const state = useProviderDoc();
  return (
    <FlowScreen title="Business profile" subtitle="What customers see about your studio" backHref="/provider-dashboard">
      <AsyncView state={state} empty="Provider profile not found." isEmpty={(d) => !d}>
        {(p) => <ProfileForm uid={state.uid!} provider={p} />}
      </AsyncView>
    </FlowScreen>
  );
}
