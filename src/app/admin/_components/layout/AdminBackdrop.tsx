"use client";

import { useAdminSidebar } from "./AdminSidebarContext";

export default function AdminBackdrop() {
  const { isMobileOpen, toggleMobileSidebar } = useAdminSidebar();

  if (!isMobileOpen) return null;

  return (
    <button
      aria-label="Close sidebar"
      className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
      onClick={toggleMobileSidebar}
      type="button"
    />
  );
}
