import type { Metadata } from "next";
import type { ReactNode } from "react";

import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Meddelanden",
  "Personliga meddelanden i CampusLyan."
);

export default function MessagesLayout({ children }: { children: ReactNode }) {
  return children;
}
