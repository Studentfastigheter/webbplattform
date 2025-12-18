"use client";

import Image from "next/image";
import ProfileHeroActions from "./ProfileHeroActions";
import {
  GraduationCap,
  MapPin,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import {
  type School,
  type SchoolId,
  type StudentWithRelations,
} from "@/types";

import { FaLinkedin, FaInstagram, FaFacebook } from "react-icons/fa6";

export type ProfileStats = {
  studyProgram?: string;
  studyPace?: string;
  preferredArea?: string;
};

// Vi utökar StudentWithRelations för att inkludera extra UI-specifika fält
// som kanske beräknas eller hämtas separat
export type StudentProfileExtended = StudentWithRelations & {
  headline?: string;
  stats?: ProfileStats;
  bannerImage?: string | null;
  avatarUrl?: string | null;
  cvUrl?: string | null;
  
  // Extra sociala fält
  linkedInUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  
  verifiedLinkedIn?: boolean;
  verifiedInstagram?: boolean;
  verifiedFacebook?: boolean;
  
  age?: number; // Om du vill visa ålder
};

type InfoItem = {
  label: string;
  value: string;
};

type ProfileHeroProps = {
  student: StudentProfileExtended;
  schoolsById?: Record<SchoolId, Pick<School, "name">>; // Notera: 'name' enligt nya School-typen
};

export default function ProfileHero({ student, schoolsById }: ProfileHeroProps) {
  const fullName = student.displayName || `${student.firstName} ${student.surname}`.trim();

  // schoolId kan vara undefined, hantera det säkert
  const schoolName = student.schoolName ?? 
    (student.schoolId && schoolsById ? schoolsById[student.schoolId]?.name : undefined);

  const bannerImage =
    student.bannerImage ?? student.bannerUrl ?? "/appartment.jpg";

  const avatarImage =
    student.avatarUrl ?? student.logoUrl ?? "/logos/campuslyan-logo.svg";

  const verificationBadge = student.verifiedStudent
    ? {
        text: "Verifierad student",
        Icon: ShieldCheck,
        className:
          "inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800",
      }
    : {
        text: "Ej verifierad",
        Icon: AlertTriangle,
        className:
          "inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800",
      };

  const infoItems: InfoItem[] = [
    {
      label: "Ålder",
      value: student.age ? `${student.age} år` : "Ej angivet",
    },
    {
      label: "Skola",
      value: schoolName ?? "Ej angivet",
    },
    {
      label: "Utbildning",
      value: student.stats?.studyProgram ?? "Ej angivet",
    },
    {
      label: "Studietakt",
      value: student.stats?.studyPace ?? "Ej angivet",
    },
  ];

  const SOCIAL_VERIFICATIONS = [
    {
      label: "LinkedIn",
      href: student.linkedInUrl,
      verified: Boolean(student.verifiedLinkedIn),
      icon: <FaLinkedin />,
    },
    {
      label: "Instagram",
      href: student.instagramUrl,
      verified: Boolean(student.verifiedInstagram),
      icon: <FaInstagram />,
    },
    {
      label: "Facebook",
      href: student.facebookUrl,
      verified: Boolean(student.verifiedFacebook),
      icon: <FaFacebook />,
    },
  ] as const;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-black/5 bg-white/80 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
      {/* Banner */}
      <div className="relative z-0 w-full aspect-[1128/191] min-h-[120px] sm:min-h-[160px] lg:min-h-[190px] bg-gray-100">
        <Image
          src={bannerImage}
          alt={fullName}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="relative z-10 px-6 pb-6 pt-0 sm:px-8">
        <div className="mt-4 grid grid-cols-1 gap-8 lg:mt-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Vänster kolumn: Avatar och Info */}
          <div className="relative">
            <div className="relative -mt-20 ml-6 h-36 w-36 sm:-mt-24 sm:ml-8 sm:h-40 sm:w-40 lg:-mt-32 lg:ml-10 lg:h-44 lg:w-44">
              <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_10px_28px_rgba(0,0,0,0.20)]">
                <Image
                  src={avatarImage}
                  alt={fullName}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="mt-4 text-left">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                  {fullName}
                </h1>

                <span className={verificationBadge.className}>
                  <verificationBadge.Icon className="h-3.5 w-3.5" />
                  {verificationBadge.text}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-700">
                {(student.city || student.stats?.preferredArea) && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-green-900" />
                    {/* Hantera om city är ett objekt eller sträng */}
                    {typeof student.city === 'string' ? student.city : student.stats?.preferredArea}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Höger kolumn: Sociala länkar och Snabbfakta */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-end gap-3">
              {SOCIAL_VERIFICATIONS.map((social) => {
                const base =
                  "flex h-10 w-10 shrink-0 aspect-square items-center justify-center rounded-full border border-slate-200 bg-white text-lg leading-none transition";
                const state = social.verified
                  ? "text-slate-700 hover:border-slate-400 hover:text-slate-900"
                  : "text-slate-400 opacity-40";

                return social.verified ? (
                  <a
                    key={social.label}
                    href={social.href ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    title={social.label}
                    className={`${base} ${state}`}
                  >
                    {social.icon}
                  </a>
                ) : (
                  <span
                    key={social.label}
                    aria-label={social.label}
                    title={social.label}
                    className={`${base} ${state}`}
                  >
                    {social.icon}
                  </span>
                );
              })}
              <div className="overflow-hidden rounded-full">
                <ProfileHeroActions editHref="/installningar" />
              </div>
            </div>

            <aside className="w-full rounded-2xl border border-gray-100 bg-white/70 px-4 py-4 sm:px-5 sm:py-5">
              <div className="mb-2 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-900" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
                    Snabbfakta om mig
                  </p>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {infoItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start justify-between gap-3 py-2"
                  >
                    <div className="text-[12px] font-medium text-gray-600">
                      {item.label}
                    </div>
                    <div className="flex-1 text-right text-[13px] text-gray-900">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}