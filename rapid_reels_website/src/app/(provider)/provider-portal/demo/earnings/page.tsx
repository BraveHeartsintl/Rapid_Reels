"use client";

import { EarningsView } from "@/components/provider/EarningsView";

export default function Page() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-white">Earnings</h1>
      <EarningsView />
    </div>
  );
}
