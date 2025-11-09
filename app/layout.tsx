import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "./components/SiteHeader/SiteHeader";
import SiteFooter from "./components/SiteFooter/SiteFooter";
import { AuthProvider } from "@/context/AuthContext";
import { SchoolProvider } from "@/context/SchoolContext";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from '@vercel/analytics/next';

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  // Viktigt för korrekta absoluta URL:er i OG/Twitter
  metadataBase: new URL("https://www.campuslyan.se"),
  title: {
    default: "CampusLyan – Gratis studentbostäder samlade på ett ställe",
    template: "%s | CampusLyan"
  },
  description:
    "CampusLyan är en gratis plattform där studenter enkelt hittar bostäder, rum och andrahandslägenheter från både privatpersoner och studentbostadsbolag.",
  keywords: [
    "studentbostad", "studentlägenhet", "studentboende",
    "bostad student", "hyra rum student", "CampusLyan",
    "andrahand student", "gratis bostadsplattform", "StudentLyan",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "CampusLyan",
    title: "CampusLyan – Gratis plattform för studentbostäder",
    description:
      "Hitta studentbostäder gratis. CampusLyan samlar annonser från både privatpersoner och etablerade bostadsbolag.",
    images: [
      { url: "/campuslyan-og.png", width: 1200, height: 630, alt: "CampusLyan" },
    ],
    locale: "sv_SE",
  },
  twitter: {
    card: "summary_large_image",
    site: "@campuslyan",           // ta bort/ändra om du inte har X-konto
    title: "CampusLyan – Gratis plattform för studentbostäder",
    description:
      "Hitta studentbostäder gratis. CampusLyan samlar annonser från både privatpersoner och etablerade bostadsbolag.",
    images: ["/campuslyan-og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  // Favicon + app-ikoner
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
  themeColor: "#ffffff",
  verification: {
    // Google Search Console
    google: "Tmla2J0Fe5oLeIHO285cw0-ScDEBqySeIu_vg1nJMes"
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans bg-background text-foreground`}>
        <SpeedInsights /> 
        <Analytics />
        <AuthProvider>
          <SchoolProvider>
            <SiteHeader />
            <main className="pt-32">{children}</main>
            <SiteFooter />
          </SchoolProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
