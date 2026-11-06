import { ProviderShell } from "@/components/layout/ProviderShell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ProviderShell>{children}</ProviderShell>;
}
