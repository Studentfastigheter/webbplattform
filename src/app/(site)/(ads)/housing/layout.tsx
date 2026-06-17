import type { Metadata } from "next";
import type { ReactNode } from "react";

import { getRequestLocale } from "@/i18n/server";
import { localizedText } from "@/i18n/text";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  return createPageMetadata({
    locale,
    path: "/housing",
    title: localizedText(
      locale,
      "Studentbostäder i Sverige",
      "Student housing in Sweden"
    ),
    description: localizedText(
      locale,
      "Sök studentbostäder, rum och köer från verifierade bostadsbolag i svenska studentstäder.",
      "Search student housing, rooms and queues from verified housing companies in Swedish student cities."
    ),
    keywords: localizedText(
      locale,
      "studentbostäder, studentlägenheter, studentrum, bostadskö student",
      "student housing, student apartments, student room, student housing queue"
    ).split(", "),
  });
}

export default function HousingLayout({ children }: { children: ReactNode }) {
  return children;
}
