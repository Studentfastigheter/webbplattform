"use client";

import type { ReactNode } from "react";
import { Globe, Mail, MapPin, Phone, Share2 } from "lucide-react";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa6";

import ReadMoreComponent from "@/components/ui/ReadMoreComponent";
import { ShareDialog } from "@/components/ui/ShareDialog";
import EntityHero, {
  type EntityHeroActionLink,
  type EntityHeroSection,
} from "@/components/shared/EntityHero";
import { type HousingQueueDTO } from "@/types/queue";
import { COMPANY_BANNER_ASPECT_RATIO } from "@/lib/banner-image";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

type QueueHeroProps = {
  queue: HousingQueueDTO;
  showShareButton?: boolean;
  disableShareButton?: boolean;
};

type QueueContactRow = {
  icon: ReactNode;
  href: string;
  title: string;
  label: string;
  external?: boolean;
};

function socialPlatformIconKey(platform: string) {
  return platform.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getSocialPlatformIcon(platform: string) {
  const key = socialPlatformIconKey(platform);

  if (key === "facebook") {
    return <FaFacebook className="h-[18px] w-[18px]" />;
  }

  if (key === "instagram") {
    return <FaInstagram className="h-[18px] w-[18px]" />;
  }

  if (key === "youtube") {
    return <FaYoutube className="h-[18px] w-[18px]" />;
  }

  if (key === "tiktok") {
    return <FaTiktok className="h-[18px] w-[18px]" />;
  }

  if (key === "linkedin") {
    return <FaLinkedin className="h-[18px] w-[18px]" />;
  }

  return <Globe className="h-[18px] w-[18px]" />;
}

function getExternalUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function getSocialItems(
  socialLinks: Record<string, string> | undefined
): EntityHeroActionLink[] {
  return Object.entries(socialLinks ?? {})
    .flatMap(([platform, url]) => {
      const label = platform.trim();
      const href = getExternalUrl(url);

      if (!label || !href) {
        return [];
      }

      return [{
        icon: getSocialPlatformIcon(label),
        href,
        label,
        external: true,
      }];
    });
}

export default function QueueHero({
  queue,
  showShareButton = true,
  disableShareButton = false,
}: QueueHeroProps) {
  const { locale, t } = useI18n();
  const bannerImage = queue.bannerUrl || "/appartment.jpg";
  const logoImage = queue.companyLogoUrl || queue.logoUrl || null;
  const description = queue.description?.trim() ?? "";
  const websiteHref = queue.website ? getExternalUrl(queue.website) : "";

  const contactRows = [
    queue.contactPhone && {
      icon: (
        <Phone className="h-3.5 w-3.5" />
      ),
      href: `tel:${queue.contactPhone.replace(/\s+/g, "")}`,
      title: localizedText(locale, "Telefon", "Phone"),
      label: queue.contactPhone,
    },
    queue.contactEmail && {
      icon: (
        <Mail className="h-3.5 w-3.5" />
      ),
      href: `mailto:${queue.contactEmail}`,
      title: localizedText(locale, "E-post", "Email"),
      label: queue.contactEmail,
    },
    websiteHref && {
      icon: (
        <Globe className="h-3.5 w-3.5" />
      ),
      href: websiteHref,
      title: localizedText(locale, "Hemsida", "Website"),
      label: websiteHref,
      external: true,
    },
  ].filter(Boolean) as QueueContactRow[];

  const socialItems = getSocialItems(queue.socialLinks);
  const heroMeta =
    queue.city || contactRows.length > 0 ? (
      <>
        {queue.city ? (
          <span className="inline-flex min-w-0 items-center gap-1.5 text-gray-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="min-w-0 break-words">{queue.city}</span>
          </span>
        ) : null}
        {contactRows.map((item) => (
          <a
            key={item.href}
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noopener noreferrer" : undefined}
            aria-label={`${item.title}: ${item.label}`}
            className="group inline-flex max-w-full min-w-0 items-center gap-2 font-medium text-gray-600 transition-colors hover:text-gray-900 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#004225]"
          >
            <span className="shrink-0 text-[#004225]">
              {item.icon}
            </span>
            <span className="min-w-0 break-all">{item.label}</span>
          </a>
        ))}
      </>
    ) : null;

  const sections = [
    description && {
      id: "about",
      title: t("queueHero.about"),
      content: (
        <ReadMoreComponent
          text={description}
          variant="large"
          textClassName="max-w-4xl text-[15px] leading-7 text-gray-600 sm:text-base sm:leading-7"
          buttonWrapClassName="justify-start"
          moreLabel={t("queueHero.readMore")}
          lessLabel={t("queueHero.showLess")}
        />
      ),
    },
  ].filter(Boolean) as EntityHeroSection[];

  return (
    <EntityHero
      title={queue.name}
      bannerImage={bannerImage}
      bannerAspectRatio={COMPANY_BANNER_ASPECT_RATIO}
      avatarImage={logoImage}
      avatarShape="rounded"
      avatarFit="contain"
      contentClassName="max-w-none px-0 sm:px-0"
      avatarWrapperClassName="pl-4 pr-4 sm:pl-6 sm:pr-6 md:pl-8"
      titleClassName="text-[24px] leading-[30px] font-semibold tracking-normal sm:text-[30px] sm:leading-[36px] lg:text-[34px] lg:leading-[40px]"
      metaClassName="mt-4 gap-x-5 gap-y-2 text-[13px] leading-5 sm:text-sm"
      actionLinksClassName="mt-1 md:mt-0"
      sectionTitleClassName="mb-2.5 text-[15px] font-semibold leading-6 text-gray-900 sm:text-base"
      meta={heroMeta}
      actionLinks={socialItems}
      headerActions={
        showShareButton ? (
          disableShareButton ? (
            <button
              type="button"
              disabled
              aria-label={t("queueHero.share")}
              title={t("queueHero.share")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-300"
            >
              <Share2 className="h-[18px] w-[18px]" />
            </button>
          ) : (
            <ShareDialog
              title={t("queueHero.shareQueueTitle")}
              description={t("queueHero.shareQueueDescription")}
              mailSubject={t("queueHero.mailSubject", { name: queue.name })}
              mailBody={t("queueHero.mailBody")}
            >
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label={t("queueHero.share")}
                title={t("queueHero.share")}
              >
                <Share2 className="h-[18px] w-[18px]" />
              </button>
            </ShareDialog>
          )
        ) : null
      }
      sections={sections}
    />
  );
}
