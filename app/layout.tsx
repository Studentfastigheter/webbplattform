import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  // Viktigt för korrekta absoluta URL:er i OG/Twitter
  metadataBase: new URL("https://www.campuslyan.se"),
  title: {
    default: "CampusLyan – Studentbostäder på ett ställe med gratis plattform",
    template: "%s – CampusLyan",
  },
  description:
    "CampusLyan är en kostnadsfri plattform där studenter hittar studentbostäder, rum, korridorer och andrahandslägenheter från både privatpersoner och studentbostadsbolag – samlat på ett ställe.",
  keywords: [
    "studentbostad",
    "studentbostäder",
    "studentlägenhet",
    "studentboende",
    "bostad student",
    "hyra rum student",
    "andrahand student",
    "studentkorridor",
    "studentlägenhet Göteborg",
    "studentbostad Stockholm",
    "studentbostad Lund",
    "studentbostad Uppsala",
    "gratis bostadsplattform",
    "CampusLyan",
  ],
  alternates: {
    canonical: "https://www.campuslyan.se",
  },
  openGraph: {
    type: "website",
    url: "https://www.campuslyan.se",
    siteName: "CampusLyan",
    title: "CampusLyan – Gratis plattform för studentbostäder",
    description:
      "CampusLyan är en kostnadsfri plattform som samlar studentbostäder, rum och lägenheter från både privatpersoner och etablerade bostadsbolag på ett ställe.",
    images: [
      {
        url: "/campuslyan-og.png",
        width: 1200,
        height: 630,
        alt: "CampusLyan – Gratis plattform för studentbostäder",
      },
    ],
    locale: "sv_SE",
  },
  twitter: {
    card: "summary_large_image",
    site: "@campuslyan", // ta bort/ändra om du inte har X-konto
    title: "CampusLyan – Gratis plattform för studentbostäder",
    description:
      "CampusLyan är en kostnadsfri plattform där studenter hittar studentbostäder, rum och lägenheter från både privatpersoner och bostadsbolag – allt samlat på ett ställe.",
    images: ["/campuslyan-og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
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
    // Google Search Console
    google: "Tmla2J0Fe5oLeIHO285cw0-ScDEBqySeIu_vg1nJMes",
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
            {/*<SiteHeader />*/}
            <main className="pt-32">{children}</main>
            <SiteFooter />
          </SchoolProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
