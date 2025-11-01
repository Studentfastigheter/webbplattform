import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "./components/SiteHeader/SiteHeader";
import SiteFooter from "./components/SiteFooter/SiteFooter";
import { AuthProvider } from "@/context/AuthContext";
import { SchoolProvider } from "@/context/SchoolContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CampusLyan",
  description: "En ny plattform för studenter att hitta sitt nästa boende – skapad av studenter, för studenter.",
  icons: { icon: "/campuslyan-logo.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans bg-background text-foreground`}>
        <AuthProvider>
          <SchoolProvider>
            <SiteHeader />
            <main className="container-page">{children}</main>
            <SiteFooter />
          </SchoolProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
