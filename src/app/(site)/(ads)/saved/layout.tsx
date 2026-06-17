import type { Metadata } from "next";
import type { ReactNode } from "react";

import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Sparade bostäder",
  "Personliga sparade bostäder i CampusLyan."
);

export default function SavedLayout({ children }: { children: ReactNode }) {
  return children;
}
