"use client";

import Image from "next/image";
import type { ComponentType } from "react";
import { Typography, type TypographyProps } from "@material-tailwind/react";
import { FaLinkedin, FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa6";
import { SiThreads } from "react-icons/si";

const Text = Typography as unknown as ComponentType<Partial<TypographyProps>>;

const FOOTER_LINKS = [
  { href: "/om", label: "Om CampusLyan" },
  { href: "/partners", label: "Samarbetspartners" },
  { href: "/for-foretag", label: "För företag" },
  { href: "/anvandarvillkor", label: "Användarvillkor" },
  { href: "/personuppgiftspolicy", label: "Personuppgiftspolicy" },
  { href: "/cookiepolicy", label: "Cookiepolicy" },
  
];

const LINK_SECTIONS = [
  { title: "Resurser", items: FOOTER_LINKS.slice(0, 4) },
  { title: "Support", items: FOOTER_LINKS.slice(4, 6) },
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
    <footer className="relative mt-16 w-full overflow-hidden border-t border-slate-100 bg-gradient-to-b  text-slate-700">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute left-[-15%] top-[-10%] h-72 w-72 rounded-full  blur-[140px]" />
        <div className="absolute right-[-10%] bottom-[-15%] h-72 w-72 rounded-full blur-[140px]" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-8">
        <div className="grid grid-cols-1 gap-10 border-b border-slate-200 pb-10 md:grid-cols-2">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
              <Image
                src="/campuslyan-logo.svg"
                alt="CampusLyan logotyp"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
                priority
              />
            </div>
            <div>
              <Text variant="h5" className="mb-3 text-slate-900">
                CampusLyan
              </Text>
              <Text variant="small" color="gray" className="max-w-lg text-base leading-relaxed text-slate-600">
                Vi gör det enkelt att hitta, jämföra och hyra studentbostäder runt om i landet.
              </Text>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {LINK_SECTIONS.map(({ title, items }) => (
              <ul key={title}>
                <Text variant="small" color="gray" className="mb-3 font-semibold uppercase tracking-wide text-slate-700">
                  {title}
                </Text>
                {items.map((item) => (
                  <li key={item.href}>
                    <Text
                      as="a"
                      href={item.href}
                      variant="small"
                      color="gray"
                      className="py-1.5 font-medium text-slate-600 transition-colors hover:text-slate-900"
                    >
                      {item.label}
                    </Text>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-6 pt-6 text-slate-500 md:flex-row md:justify-between">
          <Text variant="small" className="text-center text-slate-500">
            © {year} CampusLyan. Alla rättigheter reserverade.
          </Text>
          <div className="flex flex-wrap gap-3">
            {SOCIAL_LINKS.map((social) => (
              <Text
                key={social.label}
                as="a"
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                variant="small"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-lg text-slate-500 transition hover:border-slate-400 hover:text-slate-900"
              >
                {social.icon}
              </Text>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
