import type { MetadataRoute } from "next";
import { headers } from "next/headers";

import { isPrivateIndexingHost, siteConfig } from "@/lib/seo";

export const dynamic = "force-dynamic";

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

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
