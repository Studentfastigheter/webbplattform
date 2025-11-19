"use client";

import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { Header } from "./Header";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative">

      <Sidebar />

      <div className="flex flex-col pl-64">
        <Header />
        <main
          className="flex-1 overflow-y-auto py-16"
          role="main"
        >
          {children}
        </main>
      </div>
    </div>
  );
}