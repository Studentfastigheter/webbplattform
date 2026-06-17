import type { Metadata } from "next";
import type { ReactNode } from "react";

import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Mina köer",
  "Personlig kövy för CampusLyan."
);

export default function QueuesLayout({ children }: { children: ReactNode }) {
  return children;
}
