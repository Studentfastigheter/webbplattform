"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { PortalAccountGuard } from "@/features/auth/components/AccountRouteGuards";
import { stripLocaleFromPathname } from "@/i18n/config";
import { DashboardShell } from "./_components/layout/DashboardShell";
import { CompanyPortalAccessGuard } from "./_components/layout/CompanyPortalAccessGuard";

export function PortalLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const routingPathname = stripLocaleFromPathname(pathname);

  if (routingPathname === "/portal/login" || routingPathname === "/login") {
    return children;
  }

  return (
    <PortalAccountGuard>
      <CompanyPortalAccessGuard>
        <DashboardShell>{children}</DashboardShell>
      </CompanyPortalAccessGuard>
    </PortalAccountGuard>
  );
}
