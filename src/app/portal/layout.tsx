// app/(dashboard)/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PortalLayoutContent } from "./PortalLayoutContent";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Företagsportal",
  "Inloggad företagsportal för CampusLyans samarbetspartners."
);

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <PortalLayoutContent>{children}</PortalLayoutContent>;
}
