"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { PortalAccountGuard } from "@/features/auth/components/AccountRouteGuards";
import { DashboardShell } from "./_components/layout/DashboardShell";

export function PortalLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/portal/login" || pathname === "/login") {
    return children;
  }

  return (
    <PortalAccountGuard>
      <DashboardShell>{children}</DashboardShell>
    </PortalAccountGuard>
  );
}
