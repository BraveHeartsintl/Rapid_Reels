"use client";

import { FlowScreen } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function Page() {
  return (
    <FlowScreen title="Documents" subtitle="Identity documents are handled by our verification partner" backHref="/provider-verification">
      <div className="space-y-4">
        <Card className="space-y-2 text-sm text-[var(--rr-text-secondary)]">
          <p>
            For security, ID documents are no longer uploaded to Rapid Reels directly. Veriff captures your government ID and a selfie and
            sends the verified result to our team.
          </p>
          <p>Have a valid passport or driving licence ready, and make sure you are in a well-lit place.</p>
        </Card>
        <Button href="/provider-verification" className="w-full">Go to identity verification</Button>
      </div>
    </FlowScreen>
  );
}
