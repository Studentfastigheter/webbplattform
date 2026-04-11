"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import PortalBackdrop from "./PortalBackdrop";
import PortalHeader from "./PortalHeader";
import PortalSidebar from "./PortalSidebar";
import {
  PortalSidebarProvider,
  usePortalSidebar,
} from "./PortalSidebarContext";

const FooterContext = createContext<(content: ReactNode) => void>(() => {});

export function useDashboardFooter() {
  return useContext(FooterContext);
}

function DashboardFrame({
  children,
  footerContent,
}: {
  children: ReactNode;
  footerContent?: ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = usePortalSidebar();
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  return (
    <div className="portal-admin min-h-screen bg-gray-50 xl:flex">
      <PortalSidebar />
      <PortalBackdrop />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        <PortalHeader />
        <div className="mx-auto w-full max-w-[1536px] p-4 md:p-6">
          {children}
        </div>
      </div>
      {footerContent && (
        <div
          className={`fixed bottom-0 right-0 z-40 transition-all duration-300 ease-in-out ${mainContentMargin}`}
        >
          {footerContent}
        </div>
      )}
    </div>
  );
}

export function DashboardShell({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: ReactNode;
}) {
  const [footerContent, setFooterContent] = useState<ReactNode>(footer);

  return (
    <FooterContext.Provider value={setFooterContent}>
      <PortalSidebarProvider>
        <DashboardFrame footerContent={footerContent}>{children}</DashboardFrame>
      </PortalSidebarProvider>
    </FooterContext.Provider>
  );
}
