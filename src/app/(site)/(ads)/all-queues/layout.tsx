import type { Metadata } from "next";
import type { ReactNode } from "react";

import { getRequestLocale } from "@/i18n/server";
import { localizedText } from "@/i18n/text";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  return createPageMetadata({
    locale,
    path: "/all-queues",
    title: localizedText(
      locale,
      "Bostadsköer för studenter",
      "Housing queues for students"
    ),
    description: localizedText(
      locale,
      "Jämför bostadsköer från studentbostadsbolag och hitta rätt köer att gå med i för din studieort.",
      "Compare student housing queues and find the right queues to join for your study city."
    ),
    keywords: localizedText(
      locale,
      "bostadskö student, studentbostad kö, bostadsköer Sverige",
      "student housing queue, student accommodation queue, housing queues Sweden"
    ).split(", "),
  });
}

export default function AllQueuesLayout({ children }: { children: ReactNode }) {
  return children;
}
