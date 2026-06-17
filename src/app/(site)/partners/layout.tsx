import type { Metadata } from "next";
import type { ReactNode } from "react";

import { getRequestLocale } from "@/i18n/server";
import { localizedText } from "@/i18n/text";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  return createPageMetadata({
    locale,
    path: "/partners",
    title: localizedText(locale, "CampusLyan partners", "CampusLyan partners"),
    description: localizedText(
      locale,
      "Se bostadsföretag, studentorganisationer och partners som hjälper CampusLyan samla studentbostäder på ett ställe.",
      "See housing companies, student organizations and partners helping CampusLyan collect student housing in one place."
    ),
  });
}

export default function PartnersLayout({ children }: { children: ReactNode }) {
  return children;
}
