"use client";

import type { ReactNode } from "react";
import { Header } from "./Header";
import NavigationBreadcrumb from "./NavigationBreadcrumb"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar/AppSidebar";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }>

        <AppSidebar variant="inset" />

        <SidebarInset>
          <Header />
          <div
            className="flex-1 overflow-y-hidden"
          >
            <NavigationBreadcrumb className="pt-1 px-4 mx-2 my-4" />
            <div className="bg-white min-h-full pb-4 px-4 relative z-0">
              {children}
            </div>
          </div>
        </SidebarInset>
    </SidebarProvider>
  );
}