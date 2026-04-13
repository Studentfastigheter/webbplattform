// app/(dashboard)/layout.tsx
import type { ReactNode } from "react";
import { PortalAccountGuard } from "@/components/auth/AccountRouteGuards";
import { DashboardShell } from "../_components/DashboardShell";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <PortalAccountGuard>
      <DashboardShell>
        {children}
      </DashboardShell>
    </PortalAccountGuard>
  );
}
