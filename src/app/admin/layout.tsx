import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AdminLayoutContent } from "./AdminLayoutContent";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Admin",
  "Intern administrationsyta för CampusLyan."
);

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}
