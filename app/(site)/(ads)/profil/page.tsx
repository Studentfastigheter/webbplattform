"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { MapPin, ShieldCheck } from "lucide-react";

import ProfileHero, { type StudentProfile } from "@/components/profile/ProfileHero";
import ProfileHeroActions from "@/components/profile/ProfileHeroActions";
import { useAuth } from "@/context/AuthContext";
import { backendApi } from "@/lib/api";
import {
  type PrivateLandlordAccount,
  type School,
  type StudentAccount,
} from "@/types";

type SchoolsMap = Record<number, Pick<School, "schoolName">>;

const buildStudentProfile = (user: StudentAccount): StudentProfile => {
  const stats = {
    studyProgram: user.tags?.[0],
    studyPace: "100%",
    preferredArea: user.city ?? undefined,
    housingType: "Studentbostad",
    budget: undefined,
    moveIn: undefined,
    queueActivity: "Ingen statistik tillagd",
    updatedAt: new Date().toLocaleDateString("sv-SE"),
  };

  return {
    ...user,
    stats,
    headline: user.city ?? "Studentprofil",
    bannerImage: user.bannerUrl ?? null,
    avatarUrl: user.logoUrl ?? null,
  };
};

type PrivateLandlordProfile = PrivateLandlordAccount & {
  headline?: string;
  bannerImage?: string | null;
  avatarUrl?: string | null;
};

const buildPrivateLandlordProfile = (
  user: PrivateLandlordAccount
): PrivateLandlordProfile => ({
  ...user,
  headline: user.city ?? "Privat uthyrare",
  bannerImage: user.bannerUrl ?? null,
  avatarUrl: user.logoUrl ?? null,
});

function PrivateLandlordProfileHero({
  landlord,
}: {
  landlord: PrivateLandlordProfile;
}) {
  const bannerImage = landlord.bannerImage ?? "/appartment.jpg";
  const avatarImage = landlord.avatarUrl ?? "/logos/campuslyan-logo.svg";

  const contactItems = [
    { label: "Stad", value: landlord.city ?? undefined },
    { label: "Telefon", value: landlord.contactPhone ?? undefined },
    { label: "E-post", value: landlord.contactEmail ?? undefined },
    { label: "Anteckning", value: landlord.contactNote ?? undefined },
    { label: "Abonnemang", value: landlord.subscription ?? undefined },
  ].filter(
    (item): item is { label: string; value: string } => Boolean(item.value)
  );

  const verificationClass = landlord.verified
    ? "inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"
    : "inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-black/5 bg-white/80 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
      {/* Banner */}
      <div className="relative z-0 w-full aspect-[1128/191] min-h-[120px] sm:min-h-[160px] lg:min-h-[190px] bg-gray-100">
        {bannerImage && (
          <Image
            src={bannerImage}
            alt={landlord.fullName}
            fill
            className="object-cover"
            priority
          />
        )}
      </div>

      <div className="relative z-10 px-6 pb-6 pt-0 sm:px-8">
        <div className="mt-4 grid grid-cols-1 gap-8 lg:mt-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Left column */}
          <div>
            <div className="flex items-start gap-4">
              {/* Profile image */}
              <div className="relative -mt-10 h-28 w-28 sm:-mt-12 sm:h-32 sm:w-32 lg:-mt-14 lg:h-36 lg:w-36 overflow-hidden rounded-2xl border border-white bg-white shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
                <Image
                  src={avatarImage}
                  alt={landlord.fullName}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Name + meta */}
              <div className="mt-2 flex flex-col text-left">
                <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                  {landlord.fullName}
                </h1>

                {landlord.headline && (
                  <p className="mt-1 text-sm text-gray-600">
                    {landlord.headline}
                  </p>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-700">
                  {landlord.city && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-green-900" />
                      {landlord.city}
                    </span>
                  )}

                  <span className={verificationClass}>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {landlord.verified ? "Verifierad uthyrare" : "Ej verifierad"}
                  </span>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-green-900">
                Om mig
              </p>
              <p className="mt-2 text-base leading-relaxed text-gray-800">
                {landlord.description ?? "Ingen profiltext tillagd an."}
              </p>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            <ProfileHeroActions
              editHref="/profil/redigera"
              secondaryHref="/mina-annonser"
              secondaryLabel="Mina annonser"
              messageHref={
                landlord.contactEmail ? `mailto:${landlord.contactEmail}` : undefined
              }
            />

            {contactItems.length > 0 && (
              <aside className="w-full rounded-2xl border border-gray-100 bg-white/70 px-4 py-4 sm:px-5 sm:py-5">
                <div className="mb-2 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-900" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
                      Kontakt
                    </p>
                    <p className="text-xs text-gray-700">
                      Syns for blivande hyresgaster
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {contactItems.map((item) => (
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

export default function Page() {
  const { user, token } = useAuth();
  const [schoolsById, setSchoolsById] = useState<SchoolsMap>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.type !== "student") {
      setSchoolsById({});
      setError(null);
      return;
    }

    let active = true;
    backendApi.schools
      .list()
      .then((schools) => {
        if (!active) return;
        const map: SchoolsMap = {};
        schools.forEach((s) => {
          if (s.schoolId) {
            map[s.schoolId] = { schoolName: s.schoolName };
          }
        });
        setSchoolsById(map);
      })
      .catch((err: any) => {
        if (!active) return;
        setError(err?.message ?? "Kunde inte ladda skolor.");
      });

    return () => {
      active = false;
    };
  }, [user?.type]);

  if (!user) {
    return (
      <main className="pb-12 pt-6 lg:pt-10">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-6 text-sm text-amber-800">
          {token ? "Kunde inte ladda din profil just nu." : "Logga in for att se din profil."}
        </div>
      </main>
    );
  }

  let content: ReactNode = null;

  if (user.type === "student") {
    const profile = buildStudentProfile(user);
    content = <ProfileHero student={profile} schoolsById={schoolsById} />;
  } else if (user.type === "private_landlord") {
    const profile = buildPrivateLandlordProfile(user);
    content = <PrivateLandlordProfileHero landlord={profile} />;
  } else {
    content = (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-6 text-sm text-amber-800">
        Denna vy stoder inte kontotypen an.
      </div>
    );
  }

  return (
    <main className="pb-12 pt-6 lg:pt-10">
      <div className="flex w-full flex-col gap-6">
        {user.type === "student" && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}
        {content}
      </div>
    </main>
  );
}
