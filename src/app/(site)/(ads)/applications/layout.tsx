import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AuthenticatedSiteRouteGuard } from "@/features/auth/components/AccountRouteGuards";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Ansökningar",
  "Personlig ansökningsvy för CampusLyan."
);

export default function ApplicationsLayout({ children }: { children: ReactNode }) {
  return <AuthenticatedSiteRouteGuard>{children}</AuthenticatedSiteRouteGuard>;
}
