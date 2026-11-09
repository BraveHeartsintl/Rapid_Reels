"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlowScreen } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Notice } from "@/components/ui/State";
import { saveDraft, useBookingDraft } from "@/lib/booking/draft";

interface Venue {
  name: string;
  address: string;
  city: string;
  pincode: string;
}

export default function Page() {
  const router = useRouter();
  const draft = useBookingDraft();
  const [edits, setEdits] = useState<Partial<Venue>>({});
  const [error, setError] = useState<string | null>(null);

  const values: Venue = {
    name: edits.name ?? draft.venue?.name ?? "",
    address: edits.address ?? draft.venue?.address ?? "",
    city: edits.city ?? draft.venue?.city ?? draft.city ?? "",
    pincode: edits.pincode ?? draft.venue?.pincode ?? "",
  };
  const set = (k: keyof Venue) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setEdits((s) => ({ ...s, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.name.trim() || !values.address.trim() || !values.city.trim()) {
      return setError("Venue name, address and city are required.");
    }
    saveDraft({
      venue: {
        name: values.name.trim(),
        address: values.address.trim(),
        city: values.city.trim(),
        pincode: values.pincode.trim(),
      },
    });
    router.push("/booking-summary");
  }

  return (
    <FlowScreen title="Select venue" subtitle="Where will the event take place?" backHref="/event-details-form">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Venue name" value={values.name} onChange={set("name")} placeholder="The Grand Hall" required />
        <Input label="Address" value={values.address} onChange={set("address")} required />
        <Input label="City" value={values.city} onChange={set("city")} required />
        <Input label="Postcode / pincode" value={values.pincode} onChange={set("pincode")} />
        {error ? <Notice>{error}</Notice> : null}
        <Button type="submit" className="w-full">
          Review booking
        </Button>
      </form>
    </FlowScreen>
  );
}
