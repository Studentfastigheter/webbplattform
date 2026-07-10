import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { UserEnvironmentProvider } from "@/context/UserEnvironmentContext";
import { QueryProvider } from "@/lib/query/QueryProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";
import ScrollToTop from "@/components/layout/ScrollToTop";
import ScrollReset from "@/components/layout/ScrollReset";
import { I18nProvider } from "@/i18n/I18nProvider";
import { getDictionary, getRequestLocale } from "@/i18n/server";
import {
  indexableRobots,
  languageAlternates,
  safeJsonLd,
  siteConfig,
  websiteJsonLd,
} from "@/lib/seo";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"] });
const GOOGLE_ADSENSE_ACCOUNT = "ca-pub-8695010385893430";
const ENABLE_VERCEL_INSIGHTS = process.env.VERCEL === "1";

export const viewport: Viewport = {
  themeColor: "#efefef",
};

export async function generateMetadata(): Promise<Metadata> {
  const [dictionary, locale] = await Promise.all([getDictionary(), getRequestLocale()]);
  const metadata = dictionary.siteMetadata;
  const canonical = locale === "en" ? "/en" : "/";

  return {
    metadataBase: new URL(siteConfig.url),
    applicationName: "CampusLyan",
    creator: "CampusLyan Nordics AB",
    publisher: "CampusLyan Nordics AB",
    category: "student housing",
    title: {
      default: metadata.titleDefault,
      template: metadata.titleTemplate,
    },
    description: metadata.description,
    keywords: [...metadata.keywords],
    alternates: {
      canonical,
      languages: languageAlternates("/"),
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "CampusLyan",
      title: metadata.ogTitle,
      description: metadata.ogDescription,
      images: [
        { url: "/campuslyan-og.png", width: 1200, height: 630, alt: "CampusLyan" },
      ],
      locale: locale === "en" ? "en_US" : "sv_SE",
      alternateLocale: locale === "en" ? "sv_SE" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      site: "@campuslyan",
      title: metadata.ogTitle,
      description: metadata.ogDescription,
      images: ["/campuslyan-og.png"],
    },
    robots: indexableRobots,
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
      shortcut: ["/favicon.ico"],
    },
    manifest: "/site.webmanifest",
    verification: {
      google: "Tmla2J0Fe5oLeIHO285cw0-ScDEBqySeIu_vg1nJMes",
    },
    other: {
      "google-adsense-account": GOOGLE_ADSENSE_ACCOUNT,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [dictionary, locale] = await Promise.all([getDictionary(), getRequestLocale()]);
  const structuredData = websiteJsonLd(locale, dictionary.siteMetadata.description);

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable}`}>
      <body
        className="min-h-svh overflow-x-clip bg-background font-sans text-foreground antialiased"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
        />
        {ENABLE_VERCEL_INSIGHTS ? (
          <>
            <SpeedInsights />
            <Analytics />
          </>
        ) : null}
        {/*
          QueryProvider sits OUTSIDE AuthProvider so that AuthContext can later
          be migrated into a query (useAuthSession) without re-shuffling the
          provider tree. No consumer of QueryClient at this layer depends on
          auth state.
        */}
        <QueryProvider>
          <I18nProvider initialLocale={locale}>
          <AuthProvider>
            <UserEnvironmentProvider>
              <ScrollReset />
              <ScrollToTop />
              {children}
              <Toaster
                position="bottom-right"
                richColors
                toastOptions={{
                  duration: 4000,
                  classNames: {
                    actionButton: "",
                  },
                }}
                theme="light"
              />
            </UserEnvironmentProvider>
          </AuthProvider>
          </I18nProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
