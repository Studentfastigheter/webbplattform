import Image from "next/image";
import ReadMoreComponent from "@/components/ui/ReadMoreComponent";
import ProfileHeroActions from "./ProfileHeroActions";
import { GraduationCap, MapPin, ShieldCheck } from "lucide-react";
import { type StudentWithRelations } from "@/types";

export type ProfileStats = {
  studyProgram?: string;
  studyPace?: string;
  preferredArea?: string;
  housingType?: string;
  budget?: string;
  moveIn?: string;
  queueActivity?: string;
  updatedAt?: string;
};

export type StudentProfile = StudentWithRelations & {
  headline?: string;
  stats: ProfileStats;
  bannerImage?: string | null;
  avatarUrl?: string | null;
  cvUrl?: string | null;
};

type InfoItem = {
  label: string;
  value?: string;
};

export default function ProfileHero({ student }: { student: StudentProfile }) {
  const fullName = `${student.firstName} ${student.surname}`.trim();
  const subtitle =
    student.headline ??
    student.school?.schoolName ??
    "Studentprofil";

  const description =
    student.aboutText ??
    student.preferenceText ??
    "Ingen profiltext tillagd än.";

  const infoItems: InfoItem[] = [
    { label: "Studieinriktning", value: student.stats.studyProgram },
    { label: "Studietakt", value: student.stats.studyPace },
    {
      label: "Plats",
      value: student.stats.preferredArea ?? student.city ?? undefined,
    },
    { label: "Boende", value: student.stats.housingType },
    { label: "Budget", value: student.stats.budget },
    { label: "Inflytt", value: student.stats.moveIn },
    { label: "Köstatus", value: student.stats.queueActivity },
    { label: "Uppdaterad", value: student.stats.updatedAt },
  ].filter((item): item is Required<InfoItem> => Boolean(item.value));

  const bannerImage =
    student.bannerImage ?? student.bannerUrl ?? "/appartment.jpg";

  const avatarImage =
    student.avatarUrl ?? student.logoUrl ?? "/logos/campuslyan-logo.svg";

  const verificationClass = student.verifiedStudent
    ? "inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"
    : "inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-black/5 bg-white/80 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
      {/* Banner */}
      <div className="relative z-0 w-full aspect-[1128/191] min-h-[120px] sm:min-h-[160px] lg:min-h-[190px] bg-gray-100">
        {bannerImage && (
          <Image
            src={bannerImage}
            alt={fullName}
            fill
            className="object-cover"
            priority
          />
        )}
      </div>

      <div className="relative z-10 px-6 pb-6 pt-0 sm:px-8">
        <div className="mt-4 grid grid-cols-1 gap-8 lg:mt-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Vänster kolumn */}
          <div>
            <div className="flex items-start gap-4">
              {/* Profilbild som överlappar bannern */}
              <div className="relative -mt-10 h-28 w-28 sm:-mt-12 sm:h-32 sm:w-32 lg:-mt-14 lg:h-36 lg:w-36 overflow-hidden rounded-2xl border border-white bg-white shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
                <Image
                  src={avatarImage}
                  alt={fullName}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Namn och metainfo */}
              <div className="mt-2 flex flex-col text-left">
                <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                  {fullName}
                </h1>

                {subtitle && (
                  <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-700">
                  {(student.city || student.stats.preferredArea) && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-green-900" />
                      {student.city ?? student.stats.preferredArea}
                    </span>
                  )}

                  {student.school?.schoolName && (
                    <span className="inline-flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4 text-green-900" />
                      {student.school.schoolName}
                    </span>
                  )}

                  <span className={verificationClass}>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {student.verifiedStudent
                      ? "Verifierad student"
                      : "Ej verifierad"}
                  </span>
                </div>
              </div>
            </div>

            {/* Om mig */}
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-green-900">
                Om mig
              </p>

              <ReadMoreComponent
                text={description}
                variant="large"
                className="mt-2"
                textClassName="text-base leading-relaxed text-gray-800"
                buttonWrapClassName="pb-4"
                moreLabel="Läs mer"
                lessLabel="Visa mindre"
                scrollOffset={400}
              />
            </div>
          </div>

          {/* Höger kolumn: actions + snabbfakta */}
          <div className="flex flex-col gap-4">
            <ProfileHeroActions
              editHref="/profil/redigera"
              secondaryHref="/profil/ansokningar"
              secondaryLabel="Mina ansökningar"
              messageHref={`mailto:${student.email}`}
            />

            {infoItems.length > 0 && (
              <aside className="w-full rounded-2xl border border-gray-100 bg-white/70 px-4 py-4 sm:px-5 sm:py-5">
                <div className="mb-2 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-900" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
                      Snabbfakta om mig
                    </p>
                    <p className="text-xs text-gray-700">
                      Studier och bostadsönskemål
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
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
