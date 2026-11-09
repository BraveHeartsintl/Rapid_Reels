"use client";

import { FlowScreen } from "@/components/layout/FlowScreen";
import { EarningsView } from "@/components/provider/EarningsView";

export default function Page() {
  return (
    <FlowScreen title="Earnings" subtitle="Payments received for your events" backHref="/provider-dashboard">
      <EarningsView />
    </FlowScreen>
  );
}
