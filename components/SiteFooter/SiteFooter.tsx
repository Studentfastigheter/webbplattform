"use client";

import Image from "next/image";
import type { ComponentType } from "react";
import { Typography, type TypographyProps } from "@material-tailwind/react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok } from "react-icons/fa6";
import { HiGlobeAlt } from "react-icons/hi";
import { SiThreads } from "react-icons/si";

const Text = Typography as unknown as ComponentType<Partial<TypographyProps>>;

const COLORS = {
  primary: "#004225",
  lightestText: "#EFEFEF",
  accent: "#708A83",
};

const PLATTFORM_LINKS = [
  { href: "/bostader", label: "Bostäder" },
  { href: "/alla-koer", label: "Alla köer" },
  { href: "/for-foretag", label: "För företag" },
];

const PARTNER_LINKS = [
  { href: "/partners", label: "Våra partners" },
];

const COMPANY_LINKS = [
  { href: "/om-oss", label: "Om oss" },
  { href: "/anvandarvillkor", label: "Användarvillkor" },
  { href: "/integritetspolicy", label: "Integritetspolicy" },
  { href: "/cookiepolicy", label: "Cookiepolicy" },
];

const SOCIAL_LINKS = [
  { href: "https://www.linkedin.com/company/campuslyan", label: "LinkedIn", icon: <FaLinkedin /> },
  { href: "https://www.instagram.com/campuslyanse", label: "Instagram", icon: <FaInstagram /> },
  { href: "https://www.facebook.com/campuslyan", label: "Facebook", icon: <FaFacebook /> },
  { href: "https://www.tiktok.com/@campuslyan", label: "TikTok", icon: <FaTiktok /> },
  { href: "https://www.threads.net/@campuslyan", label: "Threads", icon: <SiThreads /> },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-40 w-full sm:mt-48 lg:mt-56" style={{ backgroundColor: COLORS.primary }}>
      <div className="absolute left-0 right-0 top-0 z-10 w-full -translate-y-[88%] overflow-hidden leading-[0]">
        <div className="relative h-[72px] w-full sm:h-[104px] lg:h-[136px]">
          <Image
            src="/footer-decoration.svg"
            alt=""
            fill
            className="object-fill"
            priority
          />
        </div>
      </div>

      <div className="relative z-20 mx-auto w-full max-w-[1400px] px-6 pb-16 pt-8 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          <div className="flex flex-col gap-8 lg:col-span-5">
            <div className="flex flex-row items-center gap-5">
              <a href="/" className="relative block h-14 w-14 shrink-0" aria-label="CampusLyan startsida">
                <Image
                  src="/campuslyan-logo.svg"
                  alt="CampusLyan"
                  fill
                  className="object-contain brightness-0 invert"
                />
              </a>

              <div className="border-l-2 py-1 pl-5" style={{ borderColor: COLORS.accent }}>
                <Text
                  className="max-w-md text-sm font-light leading-relaxed"
                  style={{ color: COLORS.lightestText }}
                >
                  Vi gör det enkelt att hitta, jämföra och hyra studentbostäder runt om i landet.
                </Text>
              </div>
            </div>

            <div className="flex gap-4 text-lg">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="transition-colors hover:opacity-80"
                  style={{ color: COLORS.lightestText }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-10 pt-4 lg:col-span-7 lg:pl-10">
            <div className="grid grid-cols-2 gap-10 md:grid-cols-3">
              {[
                { title: "Plattform", links: PLATTFORM_LINKS },
                { title: "Partners", links: PARTNER_LINKS },
                { title: "CampusLyan", links: COMPANY_LINKS },
              ].map((section) => (
                <div key={section.title}>
                  <div
                    className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest"
                    style={{ color: COLORS.lightestText }}
                  >
                    <span className="h-4 w-[2px]" style={{ backgroundColor: COLORS.accent }} />
                    {section.title}
                  </div>
                  <ul className="flex flex-col gap-3">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          className="text-xs font-bold uppercase tracking-wide transition-colors hover:underline hover:underline-offset-4"
                          style={{ color: COLORS.lightestText }}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="mt-20 flex flex-col items-start justify-between border-t pt-6 text-xs font-medium sm:flex-row sm:items-center"
          style={{ borderColor: COLORS.accent, color: COLORS.lightestText }}
        >
          <div>Copyright © {year} CampusLyan. Alla rättigheter förbehållna.</div>

          <div className="mt-4 flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80 sm:mt-0">
            <HiGlobeAlt className="text-lg" />
            <span className="uppercase tracking-wide">Svenska</span>
            <span className="text-[10px]">▼</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
