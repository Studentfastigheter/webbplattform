import type { Metadata } from "next";
import type { ReactNode } from "react";

import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Inställningar",
  "Personliga kontoinställningar för CampusLyan."
);

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return children;
}
