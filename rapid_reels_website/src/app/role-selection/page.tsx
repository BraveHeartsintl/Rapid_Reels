import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const metadata = { title: "Choose role" };

export default function RoleSelectionPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-10">
      <h1 className="text-3xl font-semibold text-white">Who are you?</h1>
      <p className="mt-2 text-sm text-[var(--rr-text-secondary)]">
        Pick a path for this static demo.
      </p>
      <div className="mt-8 space-y-4">
        <Card>
          <h2 className="text-lg font-semibold text-white">Customer</h2>
          <p className="mt-1 text-sm text-[var(--rr-text-secondary)]">
            Book events, watch reels, manage wallet.
          </p>
          <Button href="/login" className="mt-4 w-full">
            Continue as customer
          </Button>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-white">Provider</h2>
          <p className="mt-1 text-sm text-[var(--rr-text-secondary)]">
            Manage bookings, live mode, and earnings.
          </p>
          <Button href="/provider/login" className="mt-4 w-full" variant="outline">
            Continue as provider
          </Button>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-white">Admin</h2>
          <p className="mt-1 text-sm text-[var(--rr-text-secondary)]">
            Moderate content and oversee the platform.
          </p>
          <Button href="/admin/login" className="mt-4 w-full" variant="secondary">
            Continue as admin
          </Button>
        </Card>
      </div>
    </div>
  );
}
