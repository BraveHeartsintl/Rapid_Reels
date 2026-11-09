"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlowScreen } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Notice } from "@/components/ui/State";
import { saveDraft, useBookingDraft } from "@/lib/booking/draft";
import { useAuth } from "@/lib/auth/AuthProvider";
import { dateKeyLocal } from "@/lib/format";

interface Form {
  eventName: string;
  eventDate: string;
  eventTime: string;
  guestCount: string;
  contactPerson: string;
  contactNumber: string;
  specialRequirements: string;
}

export default function Page() {
  const router = useRouter();
  const draft = useBookingDraft();
  const { profile, user } = useAuth();
  const [edits, setEdits] = useState<Partial<Form>>({});
  const [error, setError] = useState<string | null>(null);

  const values: Form = {
    eventName: edits.eventName ?? draft.eventName ?? "",
    eventDate: edits.eventDate ?? draft.eventDate ?? "",
    eventTime: edits.eventTime ?? draft.eventTime ?? "10:00",
    guestCount: edits.guestCount ?? (draft.guestCount ? String(draft.guestCount) : ""),
    contactPerson: edits.contactPerson ?? draft.contactPerson ?? profile?.fullName ?? "",
    contactNumber: edits.contactNumber ?? draft.contactNumber ?? profile?.phoneNumber ?? user?.phoneNumber ?? "",
    specialRequirements: edits.specialRequirements ?? draft.specialRequirements ?? "",
  };
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setEdits((s) => ({ ...s, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const guests = Number(values.guestCount);
    if (!values.eventName.trim()) return setError("Enter an event title.");
    if (!values.eventDate) return setError("Choose an event date.");
    if (values.eventDate < dateKeyLocal(new Date())) return setError("Event date cannot be in the past.");
    if (!Number.isFinite(guests) || guests < 1) return setError("Enter the number of guests.");
    if (!values.contactPerson.trim() || !values.contactNumber.trim()) return setError("Enter a contact name and number.");
    saveDraft({
      eventName: values.eventName.trim(),
      eventDate: values.eventDate,
      eventTime: values.eventTime,
      guestCount: guests,
      contactPerson: values.contactPerson.trim(),
      contactNumber: values.contactNumber.trim(),
      specialRequirements: values.specialRequirements.trim(),
      keyMoments: values.specialRequirements
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean),
    });
    router.push("/venue-selection");
  }

  return (
    <FlowScreen title="Event details" subtitle="Tell us about the day" backHref="/package-customization">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Event title" value={values.eventName} onChange={set("eventName")} placeholder="Priya & Arjun Wedding" required />
        <Input label="Date" type="date" value={values.eventDate} min={dateKeyLocal(new Date())} onChange={set("eventDate")} required />
        <Input label="Start time" type="time" value={values.eventTime} onChange={set("eventTime")} required />
        <Input label="Guest count" type="number" min={1} value={values.guestCount} onChange={set("guestCount")} required />
        <Input label="Contact person" value={values.contactPerson} onChange={set("contactPerson")} required />
        <Input label="Contact number" type="tel" value={values.contactNumber} onChange={set("contactNumber")} required />
        <Input label="Key moments to capture" placeholder="Family entrance, cake cutting (comma separated)" value={values.specialRequirements} onChange={set("specialRequirements")} />
        {error ? <Notice>{error}</Notice> : null}
        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    </FlowScreen>
  );
}
