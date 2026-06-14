"use client";

import type { ReactNode } from "react";

import AdminBackdrop from "./AdminBackdrop";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import { AdminSidebarProvider, useAdminSidebar } from "./AdminSidebarContext";

function AdminFrame({ children }: { children: ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useAdminSidebar();
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  return (
    <div className="portal-admin min-h-screen overflow-x-clip bg-[#f6f7f9] xl:flex">
      <AdminSidebar />
      <AdminBackdrop />
      <div
        className={`min-w-0 flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        <AdminHeader />
        <div className="mx-auto w-full max-w-[1536px] min-w-0 p-4 pb-20 md:p-6 md:pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AdminSidebarProvider>
      <AdminFrame>{children}</AdminFrame>
    </AdminSidebarProvider>
  );
}
