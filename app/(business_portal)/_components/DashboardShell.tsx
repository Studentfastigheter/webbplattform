"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">

      <div className="min-h-screen">
        <Sidebar />

        <div className="flex flex-col pl-64">
          <Header />
          <main
            className="flex-1 overflow-y-auto"
            role="main"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
