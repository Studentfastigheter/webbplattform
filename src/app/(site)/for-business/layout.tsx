import type { Metadata } from "next";
import type { ReactNode } from "react";

import { getRequestLocale } from "@/i18n/server";
import { localizedText } from "@/i18n/text";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  return createPageMetadata({
    locale,
    path: "/for-business",
    title: localizedText(
      locale,
      "För bostadsföretag som vill nå studenter",
      "For housing companies that want to reach students"
    ),
    description: localizedText(
      locale,
      "CampusLyan hjälper bostadsbolag att marknadsföra studentbostäder, verifiera sökande och fylla vakanser utan extra administration.",
      "CampusLyan helps housing companies market student homes, verify applicants and fill vacancies without extra administration."
    ),
    keywords: localizedText(
      locale,
      "marknadsför studentbostäder, bostadsbolag studenter, studentbostad företag",
      "market student housing, housing companies students, student housing companies"
    ).split(", "),
  });
}

export default function ForBusinessLayout({ children }: { children: ReactNode }) {
  return children;
}
