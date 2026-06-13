"use client";

import type { ReactNode } from "react";
import ReadMoreComponent from "@/components/ui/ReadMoreComponent";
import EntityHero, {
  type EntityHeroActionLink,
  type EntityHeroSection,
} from "@/components/shared/EntityHero";
import ProfileHeroActions from "./ProfileHeroActions";
import {
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  AlertTriangle,
} from "@/components/icons";
import {
  type School,
  type SchoolId,
  type User,
} from "@/types";
import { FaLinkedin, FaInstagram, FaFacebook } from "@/components/icons";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

type ProfileStats = {
  studyProgram?: string;
  studyPace?: string;
  preferredArea?: string;
};

export type StudentProfileExtended = User & {
  school?: School | null;
  headline?: string;
  stats?: ProfileStats;
  bannerImage?: string;
  avatarUrl?: string;
  cvUrl?: string | null;
  linkedInUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  verifiedLinkedIn?: boolean;
  verifiedInstagram?: boolean;
  verifiedFacebook?: boolean;
  age?: number;
};

type InfoItem = {
  label: string;
  value: string;
};

type ProfileHeroProps = {
  student: StudentProfileExtended;
  schoolsById?: Record<SchoolId, Pick<School, "name">>;
  onEditProfile?: () => void;
};

type ProfileContactRow = {
  label: string;
  href: string;
  icon: ReactNode;
};

export default function ProfileHero({
  student,
  schoolsById,
  onEditProfile,
}: ProfileHeroProps) {
  const { locale } = useI18n();
  const fullName =
    student.displayName ||
    `${student.firstName} ${student.surname}`.trim();

  const schoolName =
    student.schoolName ??
    (student.schoolId && schoolsById
      ? schoolsById[student.schoolId]?.name
      : undefined);

  const bannerImage = student.bannerUrl ?? student.bannerImage ?? null;

  const avatarImage = student.logoUrl ?? student.avatarUrl ?? null;

  const verificationBadge = student.verifiedStudent
    ? {
        text: localizedText(locale, "Verifierad student", "Verified student"),
        Icon: ShieldCheck,
        tone: "success" as const,
      }
    : {
        text: localizedText(locale, "Ej verifierad", "Not verified"),
        Icon: AlertTriangle,
        tone: "warning" as const,
      };

  const infoItems: InfoItem[] = [
    {
      label: localizedText(locale, "Ålder", "Age"),
      value: student.age
        ? localizedText(locale, `${student.age} år`, `${student.age} years`)
        : localizedText(locale, "Ej angivet", "Not specified"),
    },
    {
      label: localizedText(locale, "Skola", "School"),
      value: schoolName ?? localizedText(locale, "Ej angivet", "Not specified"),
    },
    {
      label: localizedText(locale, "Utbildning", "Education"),
      value: student.stats?.studyProgram ?? localizedText(locale, "Ej angivet", "Not specified"),
    },
    {
      label: localizedText(locale, "Studietakt", "Study pace"),
      value: student.stats?.studyPace ?? localizedText(locale, "Ej angivet", "Not specified"),
    },
  ];

  const socialItems = [
    {
      label: "LinkedIn",
      href: student.linkedInUrl,
      verified: Boolean(student.verifiedLinkedIn),
      icon: <FaLinkedin className="h-[18px] w-[18px]" />,
    },
    {
      label: "Instagram",
      href: student.instagramUrl,
      verified: Boolean(student.verifiedInstagram),
      icon: <FaInstagram className="h-[18px] w-[18px]" />,
    },
    {
      label: "Facebook",
      href: student.facebookUrl,
      verified: Boolean(student.verifiedFacebook),
      icon: <FaFacebook className="h-[18px] w-[18px]" />,
    },
  ]
    .filter((social) => social.href || social.verified)
    .map(
      (social) =>
        ({
          label: social.label,
          href: social.href,
          icon: social.icon,
          external: true,
          disabled: !social.href || !social.verified,
        }) satisfies EntityHeroActionLink
    );

  const cityLabel =
    typeof student.city === "string"
      ? student.city
      : student.stats?.preferredArea;

  const aboutText = student.description?.trim()
    ? student.description
    : localizedText(locale, "Ingen profiltext tillagd än.", "No profile text added yet.");

  const contactRows = [
    student.email && {
      label: student.email,
      href: `mailto:${student.email}`,
      icon: (
        <Mail className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-gray-600" />
      ),
    },
    (student.phone ?? student.contactPhone) && {
      label: student.phone ?? student.contactPhone ?? "",
      href: `tel:${student.phone ?? student.contactPhone}`,
      icon: (
        <Phone className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-gray-600" />
      ),
    },
  ].filter(Boolean) as ProfileContactRow[];

  const preferenceText =
    student.stats?.preferredArea?.trim()
      ? localizedText(locale, `Jag söker boende i eller nära ${student.stats.preferredArea}.`, `I am looking for housing in or near ${student.stats.preferredArea}.`)
      : cityLabel
        ? localizedText(locale, `Jag söker boende i eller nära ${cityLabel}.`, `I am looking for housing in or near ${cityLabel}.`)
        : localizedText(locale, "Jag söker boende nära min studieort.", "I am looking for housing near my place of study.");

  const sections = [
    {
      id: "about",
      title: localizedText(locale, "Om mig", "About me"),
      content: (
        <ReadMoreComponent
          text={aboutText}
          variant="large"
          textClassName="text-base leading-relaxed text-gray-600"
          moreLabel={localizedText(locale, "Läs mer", "Read more")}
          lessLabel={localizedText(locale, "Visa mindre", "Show less")}
        />
      ),
    },
    {
      id: "seeking",
      title: localizedText(locale, "Jag söker", "I am looking for"),
      content: (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white/70 px-4 py-4 text-sm text-gray-700 sm:px-5 sm:py-5">
            {preferenceText}
          </div>

          {student.tags && student.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {student.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "facts",
      title: localizedText(locale, "Snabbfakta", "Quick facts"),
      content: (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white/70">
          <div className="divide-y divide-gray-200">
            {infoItems.map((item) => (
              <div
                key={item.label}
                className="flex items-start justify-between gap-3 px-4 py-3 sm:px-5"
              >
                <div className="text-sm font-medium text-gray-600">
                  {item.label}
                </div>
                <div className="text-right text-sm text-gray-900">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    contactRows.length > 0 && {
      id: "contact",
      title: localizedText(locale, "Kontakt", "Contact"),
      content: (
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {contactRows.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
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
      title={fullName}
      bannerImage={bannerImage}
      avatarImage={avatarImage}
      avatarShape="circle"
      avatarFit="cover"
      badge={{
        label: verificationBadge.text,
        tone: verificationBadge.tone,
        icon: <verificationBadge.Icon className="h-3.5 w-3.5" />,
      }}
      meta={
        <>
          {cityLabel && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{cityLabel}</span>
            </span>
          )}
          {schoolName && (
            <span className="inline-flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4 text-gray-400" />
              <span>{schoolName}</span>
            </span>
          )}
        </>
      }
      actionLinks={socialItems}
      headerActions={
        <ProfileHeroActions
          editHref={onEditProfile ? undefined : "/settings"}
          onEdit={onEditProfile}
          primaryLabel={localizedText(locale, "Redigera profil", "Edit profile")}
        />
      }
      sections={sections}
    />
  );
}
