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
    <div className="portal-admin min-h-screen overflow-x-clip bg-gray-50 xl:flex">
      <AdminSidebar />
      <AdminBackdrop />
      <div
        className={`min-w-0 flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        <AdminHeader />
        <div className="mx-auto w-full max-w-[1536px] min-w-0 px-3 py-4 sm:px-4 md:p-6">
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
