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
  ["/profil", "/account"],
  ["/installningar", "/account"],
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
  productionBrowserSourceMaps: true,

  allowedDevOrigins: [
    "localhost",
    "192.168.1.126",
    "*.localhost", // om du kör t.ex. app.localhost
  ],

  images: {
    formats: ["image/avif", "image/webp"],
    // TILLFÄLLIGT: backend lagrar i vissa fall externa bild-URL:er, så alla
    // värdar måste tillåtas tills backend normaliserat samtliga bilder till
    // sin egen media-URL. Backendens mediakatalog står först (den enda som
    // ska vara kvar efteråt); wildcard-raderna nedan är avsedda att tas bort
    // när migreringen är klar. OBS: wildcard gör /_next/image till en öppen
    // proxy/SSRF-yta — återinför den snäva listan så snart det går.
    remotePatterns: [
      {
        protocol: apiBaseUrl.protocol === "http:" ? "http" : "https",
        hostname: apiBaseUrl.hostname,
        ...(apiBaseUrl.port ? { port: apiBaseUrl.port } : {}),
        pathname: apiImagePathname,
      },
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },

  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API_BASE}/:path*` },
    ];
  },

  async redirects() {
    return [
      // vercel.app-produktionsdomänen får inte indexeras som kopia av sajten.
      {
        source: "/:path*",
        has: [{ type: "host", value: "webbplattform.vercel.app" }],
        destination: "https://www.campuslyan.se/:path*",
        permanent: true,
      },
      { source: "/logga-in", destination: "/login", permanent: true },
      { source: "/en/logga-in", destination: "/en/login", permanent: true },
      { source: "/logga-in/freja-id", destination: "/register/freja-id?start=freja", permanent: true },
      { source: "/en/logga-in/freja-id", destination: "/en/register/freja-id?start=freja", permanent: true },
      ...routeRedirects("/profile", "/account"),
      ...routeRedirects("/settings", "/account"),
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
