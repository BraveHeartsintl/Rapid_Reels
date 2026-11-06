import { Badge, Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockUsersAdmin } from "@/lib/mock";

export default function Page() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">Users</h1>
        <Button variant="outline" className="px-3 py-2 text-xs">Static action</Button>
      </div>
      {mockUsersAdmin.map((u) => (
        <Card key={u.id} className="mb-2 flex justify-between text-sm">
          <div>
            <p className="text-white">{u.name}</p>
            <p className="text-xs text-[var(--rr-text-tertiary)]">{u.role} · {u.city}</p>
          </div>
          <Badge tone={u.status === "active" ? "success" : "warning"}>{u.status}</Badge>
        </Card>
      ))}
    </div>
  );
}
