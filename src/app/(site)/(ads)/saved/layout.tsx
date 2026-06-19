import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AuthenticatedSiteRouteGuard } from "@/features/auth/components/AccountRouteGuards";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Sparade bostäder",
  "Personliga sparade bostäder i CampusLyan."
);

export default function SavedLayout({ children }: { children: ReactNode }) {
  return <AuthenticatedSiteRouteGuard>{children}</AuthenticatedSiteRouteGuard>;
}
