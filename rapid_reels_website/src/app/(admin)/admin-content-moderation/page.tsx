"use client";

import { PageHeader } from "@/components/layout/FlowScreen";
import { ReelModerationList } from "@/components/admin/ReelModerationList";

export default function Page() {
  return (
    <div>
      <PageHeader title="Content moderation" subtitle="All reels on the platform. Take down anything that breaks the rules." />
      <ReelModerationList initial="approved" />
    </div>
  );
}
