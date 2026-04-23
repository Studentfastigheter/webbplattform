"use client";

import type { ReactNode } from "react";
import ReadMoreComponent from "@/components/ui/ReadMoreComponent";
import { ShareDialog } from "@/components/ui/ShareDialog";
import EntityHero, {
  type EntityHeroActionLink,
  type EntityHeroSection,
} from "@/components/shared/EntityHero";
import { type HousingQueueDTO } from "@/types/queue";
import {
  Phone,
  Mail,
  Globe,
  Facebook,
  Linkedin,
  Share2,
  MapPin,
} from "lucide-react";

type QueueHeroProps = {
  queue: HousingQueueDTO;
  showShareButton?: boolean;
  disableShareButton?: boolean;
};

type QueueContactRow = {
  icon: ReactNode;
  href: string;
  label: string;
  external?: boolean;
};

export default function QueueHero({
  queue,
  showShareButton = true,
  disableShareButton = false,
}: QueueHeroProps) {
  const bannerImage = queue.bannerUrl || "/images/queue-default-banner.jpg";
  const logoImage = queue.logoUrl || "/logos/default-landlord-logo.svg";
  const description = queue.description?.trim() ?? "";

  const contactRows = [
    queue.contactPhone && {
      icon: (
        <Phone className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-gray-600" />
      ),
      href: `tel:${queue.contactPhone}`,
      label: queue.contactPhone,
    },
    queue.contactEmail && {
      icon: (
        <Mail className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-gray-600" />
      ),
      href: `mailto:${queue.contactEmail}`,
      label: queue.contactEmail,
    },
    queue.website && {
      icon: (
        <Globe className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-gray-600" />
      ),
      href: queue.website,
      label: queue.website.replace(/^https?:\/\//, ""),
      external: true,
    },
  ].filter(Boolean) as QueueContactRow[];

  const socialItems = [
    queue.socialLinks?.facebook && {
      icon: <Facebook className="h-[18px] w-[18px]" />,
      href: queue.socialLinks.facebook,
      label: "Facebook",
      external: true,
    },
    queue.socialLinks?.linkedin && {
      icon: <Linkedin className="h-[18px] w-[18px]" />,
      href: queue.socialLinks.linkedin,
      label: "LinkedIn",
      external: true,
    },
  ].filter(Boolean) as EntityHeroActionLink[];

  const sections = [
    description && {
      id: "about",
      title: "Om oss",
      content: (
        <ReadMoreComponent
          text={description}
          variant="large"
          textClassName="text-base leading-relaxed text-gray-600"
          moreLabel="Läs mer"
          lessLabel="Visa mindre"
        />
      ),
    },
    contactRows.length > 0 && {
      id: "contact",
      title: "Kontakt",
      content: (
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {contactRows.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                {...(item.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="group inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      ),
    },
  ].filter(Boolean) as EntityHeroSection[];

  return (
    <EntityHero
      title={queue.name}
      bannerImage={bannerImage}
      avatarImage={logoImage}
      avatarShape="rounded"
      avatarFit="contain"
      contentClassName="max-w-none px-0 sm:px-0"
      avatarWrapperClassName="mx-auto max-w-5xl px-4 sm:px-6"
      meta={
        queue.city ? (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-gray-400" />
            <span>{queue.city}</span>
          </span>
        ) : null
      }
      actionLinks={socialItems}
      headerActions={
        showShareButton ? (
          disableShareButton ? (
            <button
              type="button"
              disabled
              aria-label="Dela"
              title="Dela"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-300"
            >
              <Share2 className="h-[18px] w-[18px]" />
            </button>
          ) : (
            <ShareDialog
              title="Dela kö"
              description="Dela länken till den här bostadskön eller kopiera länken direkt."
              mailSubject={`Kolla in ${queue.name}`}
              mailBody="Jag hittade den här kön som kan vara intressant:"
            >
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="Dela"
                title="Dela"
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
