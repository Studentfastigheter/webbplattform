import type { Metadata } from "next";
import type { ReactNode } from "react";

import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Skapa konto",
  "Kontoregistrering för CampusLyan."
);

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children;
}
