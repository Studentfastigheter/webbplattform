"use client";

import type { ReactNode } from "react";
import { Header } from "./Header";
import NavigationBreadcrumb from "./NavigationBreadcrumb"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar/AppSidebar";
import { createContext, useContext, useState } from "react";

const FooterContext = createContext<(content: ReactNode) => void>(() => {});

export function useDashboardFooter() {
  return useContext(FooterContext);
}

export function DashboardShell({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  const [footerContent, setFooterContent] = useState<ReactNode>(footer);
  return (
    <FooterContext.Provider value={setFooterContent}>
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
              className="flex-1 overflow-y-hidden relative"
            >
              <NavigationBreadcrumb className="pt-1 px-4 mx-2 my-4" />
              <div className="bg-white min-h-full pb-4 px-4 relative z-0 flex flex-col">
                {children}
              </div>
            </div>
          </SidebarInset>
          {footerContent && (
            <div className="fixed left-[var(--sidebar-width)] right-0 bottom-0">
                {footerContent}
            </div>
          )}
      </SidebarProvider>
    </FooterContext.Provider>
  );
}