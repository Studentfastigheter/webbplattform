"use client";

import { useEffect, useState } from "react";

import ProfileHero, { type StudentProfile } from "@/components/profile/ProfileHero";
import ProfileAbout from "@/components/profile/ProfileAbout";
import { useAuth } from "@/context/AuthContext";
import { backendApi } from "@/lib/api";
import { type School, type StudentAccount } from "@/types";

type SchoolsMap = Record<number, Pick<School, "schoolName">>;

const buildProfileFromUser = (user: StudentAccount): StudentProfile => {
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
    headline: user.city ?? "Student",
    bannerImage: user.bannerUrl ?? null,
    avatarUrl: user.logoUrl ?? null,

    // ✅ make sure these exist on the built profile if your API returns them
    preferenceText: (user as any).PREFERENCE_TEXT ?? (user as any).preferenceText ?? null,
    aboutText: (user as any).ABOUT_TEXT ?? (user as any).aboutText ?? null,
  };
};

export default function Page() {
  const { user, token } = useAuth();
  const [schoolsById, setSchoolsById] = useState<SchoolsMap>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    backendApi.schools
      .list()
      .then((schools) => {
        const map: SchoolsMap = {};
        schools.forEach((s) => {
          if (s.schoolId) map[s.schoolId] = { schoolName: s.schoolName };
        });
        setSchoolsById(map);
      })
      .catch((err: any) => setError(err?.message ?? "Kunde inte ladda skolor."));
  }, []);

  if (!user || user.type !== "student") {
    return (
      <main className="px-4 py-6 pb-12 lg:px-6 lg:py-10">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-6 text-sm text-amber-800">
          {token ? "Denna vy ar for studentkonton." : "Logga in for att se din profil."}
        </div>
      </main>
    );
  }

  const profile = buildProfileFromUser(user);

  const schoolName =
    profile.school?.schoolName ??
    (profile.schoolId ? schoolsById?.[profile.schoolId]?.schoolName : undefined);

  const aboutText =
    profile.aboutText ?? "Ingen profiltext tillagd än.";

  return (
    <main className="px-4 py-6 pb-12 lg:px-6 lg:py-10">
      <div className="flex w-full flex-col gap-6">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <ProfileHero student={profile} schoolsById={schoolsById} />

        <ProfileAbout
          badges={["Rökfri", "Skötsam", "Inga betalningsanmärkningar"]}
          aboutText={aboutText}
          facts={[
            { label: "Ålder", value: (profile as any).age ? `${(profile as any).age} år` : undefined },
            { label: "Kön", value: (profile as any).gender ?? undefined },
            { label: "Utbildning", value: profile.stats.studyProgram ?? undefined },
            { label: "Skola", value: schoolName ?? undefined },
          ]}
          // ✅ THIS is the DB field you asked for
          preferenceText={(profile as any).PREFERENCE_TEXT ?? profile.preferenceText ?? null}
          interests={(profile as any).interests ?? ["Plugga", "Festa", "Paddelproffs"]}
          languages={(profile as any).languages ?? ["Svenska", "Engelska", "Spanska"]}
        />
      </div>
    </main>
  );
}
