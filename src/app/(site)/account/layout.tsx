import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AuthenticatedSiteRouteGuard } from "@/features/auth/components/AccountRouteGuards";
import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Mitt konto",
  "Personliga kontoinställningar och dokument för CampusLyan."
);

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <AuthenticatedSiteRouteGuard>{children}</AuthenticatedSiteRouteGuard>;
}
