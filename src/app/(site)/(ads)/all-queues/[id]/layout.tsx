import type { Metadata } from "next";
import { cache, type ReactNode } from "react";

import { queueService } from "@/features/queues/services/queue-service";
import { getRequestLocale } from "@/i18n/server";
import { localizedText } from "@/i18n/text";
import {
  breadcrumbJsonLd,
  companyJsonLd,
  createPageMetadata,
  safeJsonLd,
  summarizeText,
} from "@/lib/seo";

type CompanyQueueLayoutProps = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

const getCompanyForSeo = cache(async (id: string) => {
  const companyId = Number(id);

  if (!Number.isFinite(companyId) || companyId <= 0) {
    return null;
  }

  try {
    return await queueService.getCompany(companyId);
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: Omit<CompanyQueueLayoutProps, "children">): Promise<Metadata> {
  const [{ id }, locale] = await Promise.all([params, getRequestLocale()]);
  const company = await getCompanyForSeo(id);
  const path = `/all-queues/${encodeURIComponent(id)}`;
  const companyName = company?.name ?? company?.companyName ?? "CampusLyan";
  const fallbackDescription = localizedText(
    locale,
    `Se studentbostäder, bostadsköer och kontaktvägar för ${companyName} på CampusLyan.`,
    `See student homes, housing queues and contact paths for ${companyName} on CampusLyan.`
  );

  return createPageMetadata({
    locale,
    path,
    title: localizedText(
      locale,
      `${companyName} - studentbostäder och köer`,
      `${companyName} - student housing and queues`
    ),
    description: summarizeText(company?.description, fallbackDescription),
    image: company?.bannerUrl ?? company?.logoUrl,
    keywords: [
      companyName,
      "studentbostäder",
      "bostadskö",
      "student housing",
      ...(company?.cities ?? []).map((city) => city.name),
    ],
    index: Boolean(company),
  });
}

export default async function CompanyQueueLayout({
  children,
  params,
}: CompanyQueueLayoutProps) {
  const [{ id }, locale] = await Promise.all([params, getRequestLocale()]);
  const company = await getCompanyForSeo(id);

  if (!company) {
    return children;
  }

  const path = `/all-queues/${encodeURIComponent(id)}`;
  const companyName = company.name ?? company.companyName ?? "CampusLyan";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(companyJsonLd(locale, company, path)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            breadcrumbJsonLd(locale, [
              { name: localizedText(locale, "Hem", "Home"), path: "/" },
              { name: localizedText(locale, "Alla köer", "All queues"), path: "/all-queues" },
              { name: companyName, path },
            ])
          ),
        }}
      />
      {children}
    </>
  );
}
