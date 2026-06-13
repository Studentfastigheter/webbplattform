"use client";

import Image from "next/image";
import type { ComponentType } from "react";
import { Typography, type TypographyProps } from "@material-tailwind/react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok } from "@/components/icons";
import { SiThreads } from "@/components/icons";

import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { useI18n } from "@/i18n/I18nProvider";
import { isPlatformLaunched } from "@/lib/platform-launch";

const Text = Typography as unknown as ComponentType<Partial<TypographyProps>>;

const COLORS = {
  primary: "#004225",
  lightestText: "#EFEFEF",
  accent: "#708A83",
};

const SOCIAL_LINKS = [
  { href: "https://www.linkedin.com/company/campuslyan", label: "LinkedIn", icon: <FaLinkedin /> },
  { href: "https://www.instagram.com/campuslyanse", label: "Instagram", icon: <FaInstagram /> },
  { href: "https://www.facebook.com/campuslyan", label: "Facebook", icon: <FaFacebook /> },
  { href: "https://www.tiktok.com/@campuslyan", label: "TikTok", icon: <FaTiktok /> },
  { href: "https://www.threads.net/@campuslyan", label: "Threads", icon: <SiThreads /> },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();
  const { t } = useI18n();
  const platformLaunched = isPlatformLaunched();
  const platformLinks = platformLaunched
    ? [
        { href: "/housing", label: t("siteFooter.links.housing") },
        { href: "/all-queues", label: t("siteFooter.links.allQueues") },
        { href: "/for-business", label: t("siteFooter.links.forBusiness") },
      ]
    : [
        { href: "/for-business", label: t("siteFooter.links.forBusiness") },
      ];
  const partnerLinks = [
    { href: "/partners#grundande-partners", label: t("siteFooter.links.foundingPartners") },
    { href: "/partners#bostadsforetag", label: t("siteFooter.links.housingCompanies") },
    { href: "/partners#ovriga-partners", label: t("siteFooter.links.otherPartners") },
  ];
  const companyLinks = [
    { href: "/about-us", label: t("siteFooter.links.about") },
    { href: "/terms-of-service", label: t("siteFooter.links.terms") },
    { href: "/privacy-policy", label: t("siteFooter.links.privacy") },
    { href: "/cookie-policy", label: t("siteFooter.links.cookies") },
  ];

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
              <Link href="/" className="relative block h-14 w-14 shrink-0" aria-label={t("siteFooter.homeAria")}>
                <Image
                  src="/campuslyan-logo.svg"
                  alt="CampusLyan"
                  fill
                  className="object-contain brightness-0 invert"
                />
              </Link>

              <div className="border-l-2 py-1 pl-5" style={{ borderColor: COLORS.accent }}>
                <Text
                  className="max-w-md leading-tight"
                  style={{ color: COLORS.lightestText }}
                >
                  <span className="block text-2xl font-bold leading-none sm:text-[1.7rem]">
                    CampusLyan
                  </span>
                  <span className="mt-1.5 block text-sm font-light leading-relaxed sm:text-[0.95rem]">
                    {t("siteFooter.tagline")}
                  </span>
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
                { title: t("siteFooter.sections.platform"), links: platformLinks },
                { title: t("siteFooter.sections.partners"), links: partnerLinks },
                { title: t("siteFooter.sections.campuslyan"), links: companyLinks },
              ].map((section) => (
                <div key={section.title}>
                  <div
                    className="mb-5 flex items-center gap-2 text-[0.8rem] font-bold uppercase tracking-widest sm:text-sm"
                    style={{ color: COLORS.lightestText }}
                  >
                    <span className="h-4 w-[2px]" style={{ backgroundColor: COLORS.accent }} />
                    {section.title}
                  </div>
                  <ul className="flex flex-col gap-3">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-xs font-bold uppercase tracking-wide transition-colors hover:underline hover:underline-offset-4"
                          style={{ color: COLORS.lightestText }}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="mt-20 flex flex-col items-start justify-between gap-4 border-t pt-6 text-xs font-medium sm:flex-row sm:items-center"
          style={{ borderColor: COLORS.accent, color: COLORS.lightestText }}
        >
          <div>{t("siteFooter.copyright", { year })}</div>
          <LanguageSwitcher compact inverted />
        </div>
      </div>
    </footer>
  );
}
