import type { Metadata } from "next";
import { cache, type ReactNode } from "react";

import { listingService } from "@/features/listings/services/listing-service";
import { getRequestLocale } from "@/i18n/server";
import { localizedText } from "@/i18n/text";
import {
  breadcrumbJsonLd,
  createPageMetadata,
  listingJsonLd,
  safeJsonLd,
  summarizeText,
} from "@/lib/seo";

type ListingDetailLayoutProps = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

const decodeRouteParam = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const getListingForSeo = cache(async (id: string) => {
  try {
    return await listingService.get(id);
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: Omit<ListingDetailLayoutProps, "children">): Promise<Metadata> {
  const [{ id: rawId }, locale] = await Promise.all([params, getRequestLocale()]);
  const id = decodeRouteParam(rawId);
  const path = `/housing/${encodeURIComponent(id)}`;
  const listing = await getListingForSeo(id);

  if (!listing) {
    return createPageMetadata({
      locale,
      path,
      title: localizedText(locale, "Bostad på CampusLyan", "Housing on CampusLyan"),
      description: localizedText(
        locale,
        "Hitta studentbostäder, rum och bostadsköer från verifierade bostadsbolag på CampusLyan.",
        "Find student housing, rooms and housing queues from verified housing companies on CampusLyan."
      ),
      index: false,
    });
  }

  const location = [listing.area, listing.city].filter(Boolean).join(", ");
  const fallbackDescription = localizedText(
    locale,
    `Studentbostad i ${location || listing.city}. Hyra ${listing.rent} kr/mån via CampusLyan.`,
    `Student housing in ${location || listing.city}. Rent ${listing.rent} SEK/month through CampusLyan.`
  );

  return createPageMetadata({
    locale,
    path,
    title: localizedText(
      locale,
      `${listing.title} i ${listing.city}`,
      `${listing.title} in ${listing.city}`
    ),
    description: summarizeText(listing.description, fallbackDescription),
    image: listing.imageUrls?.[0],
    keywords: [
      listing.title,
      listing.city,
      listing.area,
      listing.dwellingType,
      "studentbostad",
      "student housing",
    ].filter(Boolean),
  });
}

export default async function ListingDetailLayout({
  children,
  params,
}: ListingDetailLayoutProps) {
  const [{ id: rawId }, locale] = await Promise.all([params, getRequestLocale()]);
  const id = decodeRouteParam(rawId);
  const path = `/housing/${encodeURIComponent(id)}`;
  const listing = await getListingForSeo(id);

  if (!listing) {
    return children;
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(listingJsonLd(locale, listing, path)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            breadcrumbJsonLd(locale, [
              { name: siteLabel(locale), path: "/" },
              { name: localizedText(locale, "Bostäder", "Housing"), path: "/housing" },
              { name: listing.title, path },
            ])
          ),
        }}
      />
      {children}
    </>
  );
}

function siteLabel(locale: "sv" | "en") {
  return localizedText(locale, "Hem", "Home");
}
