"use client";

import { PageHeader } from "@/components/layout/FlowScreen";
import { ReelModerationList } from "@/components/admin/ReelModerationList";

export default function Page() {
  return (
    <div>
      <PageHeader title="Reel approval" subtitle="Reels waiting to be published to Discover" />
      <ReelModerationList initial="pending_review" />
    </div>
  );
}
