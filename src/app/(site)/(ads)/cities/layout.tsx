import type { Metadata } from "next";
import type { ReactNode } from "react";

import { getRequestLocale } from "@/i18n/server";
import { localizedText } from "@/i18n/text";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  return createPageMetadata({
    locale,
    path: "/cities",
    title: localizedText(
      locale,
      "Studentstäder och bostäder nära campus",
      "Student cities and housing near campus"
    ),
    description: localizedText(
      locale,
      "Utforska svenska studentstäder, bostadsbolag, studentbostäder och köer nära universitet och högskolor.",
      "Explore Swedish student cities, housing companies, student homes and queues near universities and campuses."
    ),
    keywords: localizedText(
      locale,
      "studentstad, studentbostäder stad, bostad nära campus, universitet bostad",
      "student city, student housing city, housing near campus, university housing"
    ).split(", "),
  });
}

export default function CitiesLayout({ children }: { children: ReactNode }) {
  return children;
}
