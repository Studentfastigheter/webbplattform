import type { NextConfig } from "next";

const normalizeApiBase = (value: string): string => {
  const trimmed = value.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL saknas. Satt den i .env.local och i Vercel.");
}

const API_BASE = normalizeApiBase(apiUrl);
const apiBaseUrl = new URL(API_BASE);
const apiImagePathname = `${apiBaseUrl.pathname.replace(/\/+$/, "")}/media/**`;

const legacyRouteRedirects = [
  ["/our-queues", "/all-queues"],
  ["/bostader", "/housing"],
  ["/ansokningar", "/applications"],
  ["/sparade", "/saved"],
  ["/meddelanden", "/messages"],
  ["/notiser", "/notifications"],
  ["/profil", "/profile"],
  ["/installningar", "/settings"],
  ["/alla-koer", "/all-queues"],
  ["/koer", "/queues"],
  ["/stader", "/cities"],
  ["/registrera", "/register"],
  ["/glomt-losenord", "/forgot-password"],
  ["/anvandarvillkor", "/terms-of-service"],
  ["/integritetspolicy", "/privacy-policy"],
  ["/cookiepolicy", "/cookie-policy"],
  ["/for-foretag", "/for-business"],
  ["/om-oss", "/about-us"],
  ["/kunskapsbank", "/knowledge-bank"],
  ["/erbjudanden", "/offers"],
  ["/portal/ansokningar", "/portal/applications"],
  ["/portal/anvandare", "/portal/users"],
  ["/portal/bostadsko", "/portal/housing-queue"],
  ["/portal/guider", "/portal/guides"],
  ["/portal/installningar", "/portal/settings"],
  ["/portal/kravprofiler", "/portal/requirement-profiles"],
  ["/portal/produktnyheter", "/portal/product-news"],
  ["/portal/profil", "/portal/profile"],
] as const;

const legacyNestedRouteRedirects = [
  ["/mina-annonser/ny", "/my-listings/new"],
  ["/mina-annonser/:id/redigera", "/my-listings/:id/edit"],
  ["/mina-annonser", "/my-listings"],
  ["/portal/annonser/ny/onboarding", "/portal/listings/new/onboarding"],
  ["/portal/annonser/ny", "/portal/listings/new"],
  ["/portal/annonser/importera", "/portal/listings/import"],
  ["/portal/annonser/:id/redigera", "/portal/listings/:id/edit"],
  ["/portal/annonser", "/portal/listings"],
] as const;

function routeRedirects(source: string, destination: string) {
  const redirects = [
    { source, destination, permanent: true },
    { source: `${source}/:path*`, destination: `${destination}/:path*`, permanent: true },
    { source: `/en${source}`, destination: `/en${destination}`, permanent: true },
    { source: `/en${source}/:path*`, destination: `/en${destination}/:path*`, permanent: true },
  ];

  return redirects;
}

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "192.168.1.126",
    "*.localhost", // om du kör t.ex. app.localhost
  ],

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "www.dropbox.com" },
      { protocol: "https", hostname: "www.secretescapes.se" },
      { protocol: "https", hostname: "media.licdn.com" },
      { protocol: "https", hostname: "image-cdn.mild.cloud" },
      { protocol: "https", hostname: "img.meccdn.com" },
      { protocol: "https", hostname: "www.familjebostader.se" },
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
      { protocol: "https", hostname: "www.chalmersstudentbostader.se" },
      { protocol: "https", hostname: "www.hallnollan.se" },
      { protocol: "https", hostname: "k2a.se" },
      { protocol: "https", hostname: "campusroslagen.se" },
      { protocol: "https", hostname: "www.wikowia.se" },
      { protocol: "https", hostname: "heimstaden.com" },
      { protocol: "https", hostname: "www.hyresgastforeningen.se" },
      {
        protocol: apiBaseUrl.protocol.replace(":", "") as "http" | "https",
        hostname: apiBaseUrl.hostname,
        port: apiBaseUrl.port,
        pathname: apiImagePathname,
      },
      {
        protocol: "https",
        hostname: "sgs-fastighet.momentum.se",
        pathname: "/Prod/sgs/PmApi/**",
      },
    ],
  },

  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API_BASE}/:path*` },
    ];
  },

  async redirects() {
    return [
      { source: "/logga-in", destination: "/login", permanent: true },
      { source: "/en/logga-in", destination: "/en/login", permanent: true },
      { source: "/logga-in/freja-id", destination: "/register/freja-id?start=freja", permanent: true },
      { source: "/en/logga-in/freja-id", destination: "/en/register/freja-id?start=freja", permanent: true },
      ...legacyNestedRouteRedirects.flatMap(([source, destination]) =>
        routeRedirects(source, destination)
      ),
      ...legacyRouteRedirects.flatMap(([source, destination]) =>
        routeRedirects(source, destination)
      ),
    ];
  },
};

export default nextConfig;
