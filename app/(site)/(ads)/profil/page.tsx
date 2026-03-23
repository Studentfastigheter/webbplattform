"use client";

import { useEffect, useState } from "react";
import ProfileHero, {
  type StudentProfileExtended,
} from "@/components/profile/ProfileHero";
import { useAuth } from "@/context/AuthContext";
import { getUserDisplayName } from "@/lib/user-display";
import { authService } from "@/services/auth-service";
import { type User } from "@/types";
import {
  DUMMY_PROFILE,
  USE_DUMMY_PROFILE,
} from "./profile.dummy";

const calculateAgeFromSsn = (ssn?: string): number | undefined => {
  if (!ssn) return undefined;

  const digits = ssn.replace(/\D/g, "");
  let year: number;
  let month: number;
  let day: number;

  if (digits.length >= 12) {
    year = Number(digits.slice(0, 4));
    month = Number(digits.slice(4, 6));
    day = Number(digits.slice(6, 8));
  } else if (digits.length >= 10) {
    const shortYear = Number(digits.slice(0, 2));
    const currentShortYear = new Date().getFullYear() % 100;
    year = shortYear > currentShortYear ? 1900 + shortYear : 2000 + shortYear;
    month = Number(digits.slice(2, 4));
    day = Number(digits.slice(4, 6));
  } else {
    return undefined;
  }

  const birthDate = new Date(year, month - 1, day);
  if (Number.isNaN(birthDate.getTime())) return undefined;

  const today = new Date();
  let age = today.getFullYear() - year;
  const hasHadBirthday =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());

  if (!hasHadBirthday) age -= 1;
  return age >= 0 ? age : undefined;
};

const buildProfileFromUser = (user: User): StudentProfileExtended => {
  const fullName = getUserDisplayName(user);

  return {
    ...user,
    displayName: fullName,
    headline: user.schoolName ?? user.city ?? "Student",
    stats: {
      studyProgram: user.tags?.[0] || "Ej angivet",
      studyPace: "Ej angivet",
      preferredArea: user.city ?? undefined,
    },
    bannerImage: user.bannerUrl ?? "/appartment.jpg",
    avatarUrl: user.logoUrl ?? "/logos/campuslyan-logo.svg",
    likedListings: [],
    listingApplications: [],
    queueApplications: [],
    searchWatchlist: [],
    age: calculateAgeFromSsn(user.ssn),
  } as StudentProfileExtended;
};

export default function Page() {
  const { token, user, isLoading: authLoading } = useAuth();
  const [student, setStudent] = useState<User | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (USE_DUMMY_PROFILE) return;

    if (authLoading || !token) {
      if (!token) {
        setStudent(null);
        setError(null);
      }
      return;
    }

    let cancelled = false;

    const loadStudentProfile = async () => {
      setLoadingProfile(true);
      setError(null);

      try {
        const currentUser = await authService.me();
        if (!cancelled) setStudent(currentUser);
      } catch (err) {
        if (!cancelled) {
          setStudent(null);
          setError(
            err instanceof Error
              ? err.message
              : "Kunde inte hämta profilen från backend."
          );
        }
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    };

    loadStudentProfile();

    return () => {
      cancelled = true;
    };
  }, [authLoading, token]);

  if (USE_DUMMY_PROFILE) {
    if (authLoading) {
      return (
        <div className="p-10 text-center text-muted-foreground">
          Hämtar profil...
        </div>
      );
    }

    const profileName = getUserDisplayName(user) || DUMMY_PROFILE.displayName;
    const dummyProfile = {
      ...DUMMY_PROFILE,
      displayName: profileName,
    } satisfies StudentProfileExtended;

    return (
      <main className="mx-4 min-h-screen bg-white pb-16 sm:mx-8 lg:mx-12">
        <ProfileHero student={dummyProfile} />
      </main>
    );
  }

  if (authLoading || (token && loadingProfile && !student)) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Hämtar profil från backend...
      </div>
    );
  }

  if (!token) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Logga in för att se din profil.
      </div>
    );
  }

  if (error) {
    return <div className="p-10 text-center text-destructive">{error}</div>;
  }

  if (!student) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Ingen profil kunde laddas.
      </div>
    );
  }

  if (student.accountType !== "student") {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Den här profilsidan finns bara för studentkonton.
      </div>
    );
  }

  const profile = buildProfileFromUser(student);

  return (
    <main className="mx-4 min-h-screen bg-white pb-16 sm:mx-8 lg:mx-12">
      <ProfileHero student={profile} />
    </main>
  );
}
