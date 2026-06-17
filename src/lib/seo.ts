import type { Metadata } from "next";

import { localizePathname, type Locale } from "@/i18n/config";
import type { CityDetailedDTO } from "@/types/city";
import type { ListingDetailDTO } from "@/types/listing";
import type { CompanyDTO } from "@/features/queues/services/queue-service";

const DEFAULT_SITE_URL = "https://www.campuslyan.se";
const DEFAULT_OG_IMAGE = "/campuslyan-og.png";

export const siteConfig = {
  name: "CampusLyan",
  legalName: "CampusLyan Nordics AB",
  organizationNumber: "559587-0048",
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL),
  defaultOgImage: DEFAULT_OG_IMAGE,
  socialLinks: [
    "https://www.linkedin.com/company/campuslyan",
    "https://www.instagram.com/campuslyan",
    "https://www.facebook.com/campuslyan",
  ],
};

export const indexableRobots: NonNullable<Metadata["robots"]> = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
  },
};

export const noIndexRobots: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
  },
};

type PageMetadataInput = {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  image?: string | null;
  keywords?: string[];
  index?: boolean;
  type?: "website" | "article";
};

type BreadcrumbItem = {
  name: string;
  path: string;
};

function normalizeSiteUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, "");

  return trimmed || DEFAULT_SITE_URL;
}

function toAbsoluteUrl(value: string | URL) {
  return new URL(String(value), `${siteConfig.url}/`).toString();
}

export function absoluteUrl(pathname: string) {
  return toAbsoluteUrl(pathname);
}

export function canonicalPath(path: string, locale: Locale) {
  return localizePathname(path, locale);
}

export function languageAlternates(path: string) {
  return {
    sv: localizePathname(path, "sv"),
    en: localizePathname(path, "en"),
    "x-default": localizePathname(path, "sv"),
  };
}

export function createPageMetadata({
  locale,
  path,
  title,
  description,
  image = DEFAULT_OG_IMAGE,
  keywords,
  index = true,
  type = "website",
}: PageMetadataInput): Metadata {
  const canonical = canonicalPath(path, locale);
  const imageUrl = image ? toAbsoluteUrl(image) : toAbsoluteUrl(DEFAULT_OG_IMAGE);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
      languages: languageAlternates(path),
    },
    openGraph: {
      type,
      url: canonical,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: locale === "en" ? "en_US" : "sv_SE",
      alternateLocale: locale === "en" ? "sv_SE" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      site: "@campuslyan",
      title,
      description,
      images: [imageUrl],
    },
    robots: index ? indexableRobots : noIndexRobots,
  };
}

export function createNoIndexMetadata(title: string, description?: string): Metadata {
  return {
    title,
    description,
    robots: noIndexRobots,
  };
}

export function isPrivateIndexingHost(hostname: string | null | undefined) {
  const normalized = (hostname ?? "").split(":")[0].toLowerCase();

  return normalized.startsWith("portal.") || normalized.startsWith("admin.");
}

export function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function websiteJsonLd(locale: Locale, description: string) {
  const url = absoluteUrl(canonicalPath("/", locale));

  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      legalName: siteConfig.legalName,
      url: siteConfig.url,
      logo: absoluteUrl("/logo.png"),
      sameAs: siteConfig.socialLinks,
      taxID: siteConfig.organizationNumber,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      url: siteConfig.url,
      inLanguage: locale,
      description,
      publisher: {
        "@id": `${siteConfig.url}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteConfig.url}${canonicalPath("/housing", locale)}?city={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: siteConfig.name,
      isPartOf: {
        "@id": `${siteConfig.url}/#website`,
      },
      about: {
        "@id": `${siteConfig.url}/#organization`,
      },
      inLanguage: locale,
    },
  ];
}

export function breadcrumbJsonLd(locale: Locale, items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(canonicalPath(item.path, locale)),
    })),
  };
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function listingJsonLd(
  locale: Locale,
  listing: ListingDetailDTO,
  path: string
) {
  const addressLocality = [listing.area, listing.city].filter(Boolean).join(", ");

  return {
    "@context": "https://schema.org",
    "@type": "Apartment",
    "@id": `${absoluteUrl(canonicalPath(path, locale))}#listing`,
    name: listing.title,
    description: listing.description,
    url: absoluteUrl(canonicalPath(path, locale)),
    image: listing.imageUrls?.map((image) => absoluteUrl(image)) ?? [],
    address: {
      "@type": "PostalAddress",
      streetAddress: listing.fullAddress ?? listing.area,
      addressLocality,
      addressCountry: "SE",
    },
    floorSize: listing.sizeM2
      ? {
          "@type": "QuantitativeValue",
          value: listing.sizeM2,
          unitCode: "MTK",
        }
      : undefined,
    numberOfRooms: listing.rooms || undefined,
    amenityFeature: listing.tags?.map((tag) => ({
      "@type": "LocationFeatureSpecification",
      name: tag.displayName,
    })),
    offers: {
      "@type": "Offer",
      price: listing.rent,
      priceCurrency: "SEK",
      availability: "https://schema.org/InStock",
      validFrom: listing.published ?? listing.availableFrom ?? undefined,
      seller: {
        "@type": "Organization",
        name: listing.ownerName,
      },
    },
  };
}

export function cityJsonLd(locale: Locale, city: CityDetailedDTO, path: string) {
  const cityName = city.city ?? city.code ?? "";

  return {
    "@context": "https://schema.org",
    "@type": "Place",
    "@id": `${absoluteUrl(canonicalPath(path, locale))}#place`,
    name: cityName,
    description: city.description ?? undefined,
    url: absoluteUrl(canonicalPath(path, locale)),
    image: city.bannerUrl ? absoluteUrl(city.bannerUrl) : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: cityName,
      addressCountry: "SE",
    },
  };
}

export function companyJsonLd(locale: Locale, company: CompanyDTO, path: string) {
  const companyName = company.name ?? company.companyName ?? siteConfig.name;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${absoluteUrl(canonicalPath(path, locale))}#organization`,
    name: companyName,
    description: company.description ?? undefined,
    url: absoluteUrl(canonicalPath(path, locale)),
    logo: company.logoUrl ? absoluteUrl(company.logoUrl) : undefined,
    sameAs: company.websiteUrl ? [company.websiteUrl] : undefined,
    areaServed: company.cities?.map((city) => ({
      "@type": "City",
      name: city,
    })),
  };
}

export function summarizeText(value: string | null | undefined, fallback: string) {
  const normalized = value?.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return fallback;
  }

  if (normalized.length <= 155) {
    return normalized;
  }

  return `${normalized.slice(0, 152).trim()}...`;
}
