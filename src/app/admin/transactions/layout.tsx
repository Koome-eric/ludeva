import { ModuleGate } from "@/components/admin/ModuleGate";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ModuleGate module="transactions">{children}</ModuleGate>;
}
