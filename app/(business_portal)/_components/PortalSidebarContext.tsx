"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type PortalSidebarContextType = {
  isExpanded: boolean;
  isMobileOpen: boolean;
  isHovered: boolean;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setIsHovered: (isHovered: boolean) => void;
};

const PortalSidebarContext =
  createContext<PortalSidebarContextType | undefined>(undefined);

export function usePortalSidebar() {
  const context = useContext(PortalSidebarContext);

  if (!context) {
    throw new Error("usePortalSidebar must be used within PortalSidebarProvider");
  }

  return context;
}

export function PortalSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (!mobile) {
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <PortalSidebarContext.Provider
      value={{
        isExpanded: isMobile ? false : isExpanded,
        isMobileOpen,
        isHovered,
        toggleSidebar: () => setIsExpanded((current) => !current),
        toggleMobileSidebar: () => setIsMobileOpen((current) => !current),
        setIsHovered,
      }}
    >
      {children}
    </PortalSidebarContext.Provider>
  );
}
