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
  title: "CampusLyan – Gratis studentbostäder samlade på ett ställe",
  description:
    "CampusLyan är en gratis plattform där studenter enkelt hittar bostäder, rum och andrahandslägenheter från både privatpersoner och studentbostadsbolag. Skapad av studenter – för studenter.",
  keywords: [
    "studentbostad",
    "studentlägenhet",
    "studentboende",
    "bostad student",
    "hyra rum student",
    "CampusLyan",
    "andrahand student",
    "gratis bostadsplattform"
  ],
  openGraph: {
    title: "CampusLyan – Gratis plattform för studentbostäder",
    description:
      "Hitta studentbostäder gratis. CampusLyan samlar annonser från både privatpersoner och etablerade bostadsbolag.",
    url: "https://www.campuslyan.se",
    siteName: "CampusLyan",
    images: [{ url: "/campuslyan-og.png" }],
    type: "website",
  },
  icons: { icon: "/campuslyan-logo.svg" },
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
