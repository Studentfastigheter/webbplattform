import type { MetadataRoute } from "next";
import { headers } from "next/headers";

import { locales, localizePathname } from "@/i18n/config";
import {
  isPlatformLaunched,
  prelaunchPublicSitePathnames,
} from "@/lib/platform-launch";
import { isPrivateIndexingHost, siteConfig } from "@/lib/seo";

export const dynamic = "force-dynamic";

const prelaunchBlockedPaths = [
  "/admin",
  "/all-queues",
  "/api/",
  "/applications",
  "/cities",
  "/forgot-password",
  "/housing",
  "/knowledge-bank",
  "/login",
  "/messages",
  "/my-listings",
  "/notifications",
  "/offers",
  "/portal",
  "/profile",
  "/queues",
  "/register",
  "/saved",
  "/settings",
];

function localizedRobotsPaths(paths: readonly string[]) {
  return paths.flatMap((path) =>
    locales.map((locale) => localizePathname(path, locale))
  );
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerStore = await headers();
  const host = headerStore.get("host");

  if (isPrivateIndexingHost(host)) {
    return {
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    };
  }

  if (!isPlatformLaunched()) {
    return {
      rules: {
        userAgent: "*",
        allow: [
          ...localizedRobotsPaths(prelaunchPublicSitePathnames),
          "/_next/static/",
          "/_next/image/",
          "/apple-touch-icon.png",
          "/campuslyan-og.png",
          "/favicon.ico",
          "/site.webmanifest",
        ],
        disallow: localizedRobotsPaths(prelaunchBlockedPaths),
      },
      sitemap: `${siteConfig.url}/sitemap.xml`,
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
