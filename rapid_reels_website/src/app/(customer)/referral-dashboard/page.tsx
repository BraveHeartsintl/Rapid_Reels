import { PageHeader } from "@/components/layout/FlowScreen";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockUser } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <PageHeader title="Referrals" subtitle="Invite friends, earn wallet credit" />
      <Card className="mb-4 text-center">
        <p className="text-sm text-[var(--rr-text-secondary)]">Your code</p>
        <p className="mt-2 text-2xl font-bold text-[var(--rr-secondary)]">{mockUser.referralCode}</p>
        <Button href="/referral-history" className="mt-4" variant="outline">View history</Button>
      </Card>
      <p className="text-sm text-[var(--rr-text-tertiary)]">Share via WhatsApp / Instagram (static share sheet placeholder).</p>
    </div>
  );
}
