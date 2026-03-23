"use client";

import Image from "next/image";
import ReadMoreComponent from "@/components/ui/ReadMoreComponent";
import { ShareDialog } from "@/components/ui/ShareDialog";
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
};

export default function QueueHero({ queue }: QueueHeroProps) {
  const bannerImage = queue.bannerUrl || "/images/queue-default-banner.jpg";
  const logoImage = queue.logoUrl || "/logos/default-landlord-logo.svg";
  const description = queue.description ?? "";

  const contactRows = [
    queue.contactPhone && {
      icon: Phone,
      href: `tel:${queue.contactPhone}`,
      label: queue.contactPhone,
    },
    queue.contactEmail && {
      icon: Mail,
      href: `mailto:${queue.contactEmail}`,
      label: queue.contactEmail,
    },
    queue.website && {
      icon: Globe,
      href: queue.website,
      label: queue.website.replace(/^https?:\/\//, ""),
      external: true,
    },
  ].filter(Boolean) as {
    icon: typeof Phone;
    href: string;
    label: string;
    external?: boolean;
  }[];

  const socialItems = [
    queue.socialLinks?.facebook && {
      icon: Facebook,
      href: queue.socialLinks.facebook,
      label: "Facebook",
    },
    queue.socialLinks?.linkedin && {
      icon: Linkedin,
      href: queue.socialLinks.linkedin,
      label: "LinkedIn",
    },
  ].filter(Boolean) as {
    icon: typeof Facebook;
    href: string;
    label: string;
  }[];

  return (
    <section className="w-full">
      {/* Banner */}
      <div className="relative w-full h-[220px] sm:h-[280px] md:h-[340px] bg-gray-200 overflow-hidden rounded-2xl">
        <Image
          src={bannerImage}
          alt={queue.name}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
        {/* Logo overlapping banner */}
        <div className="relative -mt-14 sm:-mt-24 mb-4">
          <div className="h-28 w-28 sm:h-36 sm:w-36 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg">
            <Image
              src={logoImage}
              alt={queue.name}
              width={112}
              height={112}
              className="h-full w-full object-contain p-2"
              unoptimized
            />
          </div>
        </div>

        {/* Header: name, city, actions */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
              {queue.name}
            </h1>
            {queue.city && (
              <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                <MapPin className="h-3.5 w-3.5" />
                <span>{queue.city}</span>
              </div>
            )}
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-1.5 shrink-0 pt-1">
            {socialItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-9 w-9 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label={item.label}
                title={item.label}
              >
                <item.icon className="h-[18px] w-[18px]" />
              </a>
            ))}
            {socialItems.length > 0 && (
              <div className="h-5 w-px bg-gray-200 mx-0.5" />
            )}
            <ShareDialog>
              <button
                type="button"
                className="inline-flex items-center justify-center h-9 w-9 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Dela"
                title="Dela"
              >
                <Share2 className="h-[18px] w-[18px]" />
              </button>
            </ShareDialog>
          </div>
        </div>

        {/* About section */}
        {description && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Om oss
            </h2>
            <ReadMoreComponent
              text={description}
              variant="large"
              textClassName="text-base leading-relaxed text-gray-600"
              moreLabel="Läs mer"
              lessLabel="Visa mindre"
            />
          </div>
        )}

        {/* Contact */}
        {contactRows.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Kontakt
            </h2>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {contactRows.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    {...(item.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="group inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <item.icon className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </section>
  );
}
