import type { Metadata } from "next";
import type { ReactNode } from "react";

import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Mina annonser",
  "Annonsadministration för CampusLyan."
);

export default function MyListingsLayout({ children }: { children: ReactNode }) {
  return children;
}
