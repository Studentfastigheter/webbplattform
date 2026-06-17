import type { MetadataRoute } from "next";

import { cityService } from "@/features/cities/services/city-service";
import { listingService } from "@/features/listings/services/listing-service";
import { queueService } from "@/features/queues/services/queue-service";
import { locales, localizePathname, type Locale } from "@/i18n/config";
import {
  isPlatformLaunched,
  prelaunchPublicSitePathnames,
} from "@/lib/platform-launch";
import { absoluteUrl, languageAlternates } from "@/lib/seo";
import type { ListingCardDTO } from "@/types/listing";

export const revalidate = 3600;

type SitemapEntry = MetadataRoute.Sitemap[number];

type PublicRoute = {
  path: string;
  priority: number;
  changeFrequency: SitemapEntry["changeFrequency"];
};

const staticRoutes: PublicRoute[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/housing", priority: 0.95, changeFrequency: "hourly" },
  { path: "/cities", priority: 0.85, changeFrequency: "daily" },
  { path: "/all-queues", priority: 0.85, changeFrequency: "daily" },
  { path: "/for-business", priority: 0.8, changeFrequency: "monthly" },
  { path: "/partners", priority: 0.75, changeFrequency: "monthly" },
  { path: "/about-us", priority: 0.7, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.65, changeFrequency: "monthly" },
  { path: "/terms-of-service", priority: 0.25, changeFrequency: "yearly" },
  { path: "/privacy-policy", priority: 0.25, changeFrequency: "yearly" },
  { path: "/cookie-policy", priority: 0.2, changeFrequency: "yearly" },
];

const now = new Date();

function localizedEntries(
  path: string,
  {
    priority,
    changeFrequency,
    lastModified = now,
  }: {
    priority: number;
    changeFrequency: SitemapEntry["changeFrequency"];
    lastModified?: Date | string;
  }
): SitemapEntry[] {
  const languages = Object.fromEntries(
    Object.entries(languageAlternates(path)).map(([locale, href]) => [
      locale,
      absoluteUrl(href),
    ])
  );

  return locales.map((locale: Locale) => ({
    url: absoluteUrl(localizePathname(path, locale)),
    lastModified,
    changeFrequency,
    priority,
    alternates: {
      languages,
    },
  }));
}

async function resolveSitemapEntries<T>(
  getValue: () => Promise<T>,
  mapValue: (value: T) => SitemapEntry[]
) {
  try {
    return mapValue(await getValue());
  } catch {
    return [];
  }
}

function publishedListingEntries(listings: ListingCardDTO[]) {
  return listings
    .filter((listing) => {
      const status = listing.status?.toString().toUpperCase();
      return !status || status === "AVAILABLE";
    })
    .flatMap((listing) =>
      localizedEntries(`/housing/${encodeURIComponent(listing.id)}`, {
        priority: 0.8,
        changeFrequency: "daily",
        lastModified: listing.published ?? now,
      })
    );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const isLaunched = isPlatformLaunched();
  const visibleStaticRoutes = isLaunched
    ? staticRoutes
    : staticRoutes.filter((route) =>
        prelaunchPublicSitePathnames.includes(
          route.path as (typeof prelaunchPublicSitePathnames)[number]
        )
      );
  const staticEntries = visibleStaticRoutes.flatMap((route) =>
    localizedEntries(route.path, {
      priority: route.priority,
      changeFrequency: route.changeFrequency,
    })
  );

  if (!isLaunched) {
    return staticEntries;
  }

  const [cityEntries, listingEntries, companyEntries] = await Promise.all([
    resolveSitemapEntries(() => cityService.list(), (cities) =>
      cities.flatMap((city) => {
        const code = city.code ?? city.city;
        if (!code) {
          return [];
        }

        return localizedEntries(`/cities/${encodeURIComponent(code)}`, {
          priority: 0.78,
          changeFrequency: "weekly",
        });
      })
    ),
    resolveSitemapEntries(
      () => listingService.getAll({ page: 0, size: 1000 }),
      (response) => publishedListingEntries(response.content ?? [])
    ),
    resolveSitemapEntries(() => queueService.getAll(), (queues) => {
      const companyIds = Array.from(
        new Set(
          queues
            .map((queue) => queue.companyId)
            .filter((companyId) => Number.isFinite(companyId) && companyId > 0)
        )
      );

      return companyIds.flatMap((companyId) =>
        localizedEntries(`/all-queues/${companyId}`, {
          priority: 0.72,
          changeFrequency: "weekly",
        })
      );
    }),
  ]);

  return [
    ...staticEntries,
    ...cityEntries,
    ...listingEntries,
    ...companyEntries,
  ];
}
