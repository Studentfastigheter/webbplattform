// app/(dashboard)/layout.tsx
import type { ReactNode } from "react";
import { PortalLayoutContent } from "./PortalLayoutContent";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <PortalLayoutContent>{children}</PortalLayoutContent>;
}
