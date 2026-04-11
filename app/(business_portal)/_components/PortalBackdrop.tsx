"use client";

import { usePortalSidebar } from "./PortalSidebarContext";

export default function PortalBackdrop() {
  const { isMobileOpen, toggleMobileSidebar } = usePortalSidebar();

  if (!isMobileOpen) return null;

  return (
    <button
      aria-label="Stäng sidomenyn"
      className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
      onClick={toggleMobileSidebar}
      type="button"
    />
  );
}
