import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Contexts & Providers
import { AuthProvider } from "@/context/AuthContext";
import { SchoolProvider } from "@/context/SchoolContext";

// Components
// import SiteHeader from "./components/SiteHeader/SiteHeader";
import SiteFooter from "./components/SiteFooter/SiteFooter";

// Vercel Analytics & Insights
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

// 1. Konfigurera fonten (Plus Jakarta Sans)
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta", // Måste matcha var(--font-jakarta) i globals.css
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.campuslyan.se"),
  title: "CampusLyan",
  description: "Din guide till studentlivet och boende.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" suppressHydrationWarning>
      {/* 2. Applicera variabeln och font-sans klassen */}
      <body
        className={`${jakarta.variable} font-sans antialiased bg-background text-foreground`}
      >
        <SpeedInsights />
        <Analytics />
          <AuthProvider>
            <SchoolProvider>
              {/* <SiteHeader /> */}
              {/* min-h-screen ser till att footern hamnar längst ner om innehållet är kort */}
              <main className="min-h-screen">
                {children}
              </main>
              
              <SiteFooter />
            </SchoolProvider>
          </AuthProvider>
      </body>
    </html>
  );
}