import type { Metadata } from "next";
import type { ReactNode } from "react";

import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Logga in",
  "Inloggning för CampusLyan."
);

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
