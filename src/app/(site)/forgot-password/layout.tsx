import type { Metadata } from "next";
import type { ReactNode } from "react";

import { createNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = createNoIndexMetadata(
  "Återställ lösenord",
  "Återställning av lösenord för CampusLyan."
);

export default function ForgotPasswordLayout({ children }: { children: ReactNode }) {
  return children;
}
