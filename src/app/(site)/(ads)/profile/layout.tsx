import type { Metadata } from "next";
import type { ReactNode } from "react";

import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Profil",
  "Personlig profilvy för CampusLyan."
);

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return children;
}
