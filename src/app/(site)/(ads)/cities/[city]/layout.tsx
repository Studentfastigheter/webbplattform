import type { Metadata } from "next";
import { cache, type ReactNode } from "react";

import { cityDisplayName, formatCityName } from "@/features/cities/city-utils";
import { cityService } from "@/features/cities/services/city-service";
import { getRequestLocale } from "@/i18n/server";
import { localizedText } from "@/i18n/text";
import {
  breadcrumbJsonLd,
  cityJsonLd,
  createPageMetadata,
  safeJsonLd,
  summarizeText,
} from "@/lib/seo";

type CityDetailLayoutProps = {
  children: ReactNode;
  params: Promise<{ city: string }>;
};

const decodeRouteParam = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const getCityForSeo = cache(async (city: string) => {
  try {
    return await cityService.get(city);
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: Omit<CityDetailLayoutProps, "children">): Promise<Metadata> {
  const [{ city: rawCity }, locale] = await Promise.all([params, getRequestLocale()]);
  const cityParam = decodeRouteParam(rawCity);
  const city = await getCityForSeo(cityParam);
  const cityName =
    cityDisplayName(city) || formatCityName(cityParam) || cityParam;
  const path = `/cities/${encodeURIComponent(city?.code ?? cityParam)}`;
  const fallbackDescription = localizedText(
    locale,
    `Hitta studentbostäder, bostadsköer och bostadsbolag i ${cityName}.`,
    `Find student housing, housing queues and housing companies in ${cityName}.`
  );

  return createPageMetadata({
    locale,
    path,
    title: localizedText(
      locale,
      `Studentbostäder i ${cityName}`,
      `Student housing in ${cityName}`
    ),
    description: summarizeText(city?.description, fallbackDescription),
    image: city?.bannerUrl,
    keywords: [
      `studentbostad ${cityName}`,
      `studentlägenhet ${cityName}`,
      `bostadskö ${cityName}`,
      `student housing ${cityName}`,
    ],
    index: Boolean(city),
  });
}

export default async function CityDetailLayout({
  children,
  params,
}: CityDetailLayoutProps) {
  const [{ city: rawCity }, locale] = await Promise.all([params, getRequestLocale()]);
  const cityParam = decodeRouteParam(rawCity);
  const city = await getCityForSeo(cityParam);

  if (!city) {
    return children;
  }

  const cityName =
    cityDisplayName(city) || formatCityName(cityParam) || cityParam;
  const path = `/cities/${encodeURIComponent(city.code ?? cityParam)}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(cityJsonLd(locale, city, path)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            breadcrumbJsonLd(locale, [
              { name: localizedText(locale, "Hem", "Home"), path: "/" },
              { name: localizedText(locale, "Städer", "Cities"), path: "/cities" },
              { name: cityName, path },
            ])
          ),
        }}
      />
      {children}
    </>
  );
}
