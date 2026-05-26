// app/(dashboard)/layout.tsx
import type { ReactNode } from "react";
import { PortalAccountGuard } from "@/features/auth/components/AccountRouteGuards";
import { DashboardShell } from "../_components/layout/DashboardShell";

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
