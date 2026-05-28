"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AdminAccountGuard } from "@/features/auth/components/AccountRouteGuards";
import { AdminShell } from "./_components/layout/AdminShell";

export function AdminLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login" || pathname === "/login") {
    return children;
  }

  return (
    <AdminAccountGuard>
      <AdminShell>{children}</AdminShell>
    </AdminAccountGuard>
  );
}
