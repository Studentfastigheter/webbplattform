import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AuthenticatedSiteRouteGuard } from "@/features/auth/components/AccountRouteGuards";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Notiser",
  "Personliga notiser i CampusLyan."
);

export default function NotificationsLayout({ children }: { children: ReactNode }) {
  return <AuthenticatedSiteRouteGuard>{children}</AuthenticatedSiteRouteGuard>;
}
