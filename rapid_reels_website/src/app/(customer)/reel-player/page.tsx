import { PageHeader } from "@/components/layout/FlowScreen";
import { Button } from "@/components/ui/Button";
import { mockReels } from "@/lib/mock";

export default function Page() {
  const r = mockReels[0];
  return (
    <div>
      <PageHeader title={r.title} subtitle={r.author} />
      <div className="mb-4 flex aspect-[9/16] max-h-[60vh] items-center justify-center rounded-2xl bg-gradient-to-b from-[var(--rr-primary)]/40 to-[var(--rr-surface)] text-[var(--rr-text-tertiary)]">
        Video player placeholder
      </div>
      <p className="text-sm text-[var(--rr-text-secondary)]">♥ {r.likes} · 💬 {r.comments}</p>
      <div className="mt-4 flex gap-2">
        <Button href="/reel-details" variant="outline">Details</Button>
        <Button href="/reel-share">Share</Button>
      </div>
    </div>
  );
}
