"use client";

import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { Header } from "./Header";
import NavigationBreadcrumb from "./NavigationBreadcrumb"

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative">

      <Sidebar />

      <div className="flex flex-col pl-56">
        <Header />
        <main
          className="flex-1 overflow-y-auto py-16"
          role="main"
        >
          <NavigationBreadcrumb className="pt-1 px-4 mx-2 mt-2 mb-4" />
          <div className="bg-white min-h-full pb-4 px-4 relative z-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}