"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import ProfileHero, {
  type StudentProfileExtended,
} from "@/components/profile/ProfileHero";
import ProfileDocumentsSection from "@/components/profile/ProfileDocumentsSection";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getUserDisplayName } from "@/lib/user-display";
import { authService } from "@/services/auth-service";
import { type UpdateUserRequest, type User } from "@/types";
import {
  AlertTriangle,
  Check,
  Facebook,
  GraduationCap,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  X,
} from "lucide-react";

type StudentProfileDraft = {
  firstName: string;
  surname: string;
  email: string;
  phone: string;
  city: string;
  schoolName: string;
  description: string;
  studyProgram: string;
  studyPace: string;
  preferredArea: string;
  tagsText: string;
  linkedInUrl: string;
  instagramUrl: string;
  facebookUrl: string;
};

const inlineInputClass =
  "min-w-0 rounded-md border border-[#004225]/10 bg-[#004225]/[0.035] px-2 py-1 outline-none transition hover:border-[#004225]/25 hover:bg-white focus:border-[#004225] focus:bg-white focus:ring-4 focus:ring-[#004225]/10";

const fieldInputClass =
  "min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition hover:border-[#004225]/30 focus:border-[#004225] focus:ring-4 focus:ring-[#004225]/10";

const editPanelClass =
  "rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-[0_12px_35px_rgba(15,23,42,0.04)] sm:p-5";

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

const getCityValue = (city: User["city"]): string => {
  if (!city) return "";
  if (typeof city === "string") return city;
  return (city as { name?: string }).name ?? "";
};

const parseTags = (value: string): string[] =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

const buildProfileFromUser = (user: User): StudentProfileExtended => {
  const fullName = getUserDisplayName(user);
  const city = getCityValue(user.city);
  const studyProgram = user.studyProgram ?? user.tags?.[0] ?? "Ej angivet";
  const preferredArea = user.preferredArea ?? city;

  return {
    ...user,
    city,
    displayName: fullName,
    headline: user.schoolName || city || "Student",
    stats: {
      studyProgram,
      studyPace: user.studyPace ?? "Ej angivet",
      preferredArea: preferredArea || undefined,
    },
    bannerImage: user.bannerUrl,
    avatarUrl: user.logoUrl,
    likedListings: [],
    listingApplications: [],
    queueApplications: [],
    searchWatchlist: [],
    age: calculateAgeFromSsn(user.ssn),
  } as StudentProfileExtended;
};

const buildDraftFromUser = (user: User): StudentProfileDraft => ({
  firstName: user.firstName ?? "",
  surname: user.surname ?? "",
  email: user.email ?? "",
  phone: user.phone ?? user.contactPhone ?? "",
  city: getCityValue(user.city),
  schoolName: user.schoolName ?? "",
  description: user.description ?? "",
  studyProgram: user.studyProgram ?? user.tags?.[0] ?? "",
  studyPace: user.studyPace ?? "",
  preferredArea: user.preferredArea ?? getCityValue(user.city),
  tagsText: user.tags?.join(", ") ?? "",
  linkedInUrl: user.linkedInUrl ?? "",
  instagramUrl: user.instagramUrl ?? "",
  facebookUrl: user.facebookUrl ?? "",
});

const getDraftSnapshot = (draft: StudentProfileDraft | null): string =>
  draft ? JSON.stringify(draft) : "";

const buildUpdatePayload = (draft: StudentProfileDraft): UpdateUserRequest => {
  const tags = parseTags(draft.tagsText);

  return {
    displayName: `${draft.firstName} ${draft.surname}`.trim() || undefined,
    firstName: draft.firstName.trim() || undefined,
    surname: draft.surname.trim() || undefined,
    email: draft.email.trim() || undefined,
    phone: draft.phone.trim() || undefined,
    city: draft.city.trim() || undefined,
    schoolName: draft.schoolName.trim() || undefined,
    studyProgram: draft.studyProgram.trim() || undefined,
    studyPace: draft.studyPace.trim() || undefined,
    preferredArea: draft.preferredArea.trim() || undefined,
    tags,
    linkedInUrl: draft.linkedInUrl.trim() || undefined,
    instagramUrl: draft.instagramUrl.trim() || undefined,
    facebookUrl: draft.facebookUrl.trim() || undefined,
    aboutText: draft.description.trim() || undefined,
    description: draft.description.trim() || undefined,
  };
};

function InlineLabel({ children }: { children: string }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
      {children}
    </span>
  );
}

function EditableRow({
  label,
  value,
  placeholder,
  type = "text",
  icon,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  icon?: ReactNode;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2">
      {icon}
      <span className="sr-only">{label}</span>
      <input
        aria-label={label}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={fieldInputClass}
        placeholder={placeholder}
      />
    </label>
  );
}

function EditableFactRow({
  label,
  value,
  placeholder,
  readOnly = false,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
      <span className="shrink-0 text-sm font-medium text-gray-600">{label}</span>
      <input
        aria-label={label}
        value={value}
        readOnly={readOnly}
        disabled={readOnly}
        onChange={(event) => onChange?.(event.target.value)}
        className={`${inlineInputClass} max-w-[220px] text-right text-sm text-gray-900 disabled:border-transparent disabled:bg-transparent disabled:px-0 disabled:opacity-100`}
        placeholder={placeholder}
      />
    </label>
  );
}

function EditableStudentProfile({
  student,
  draft,
  onDraftChange,
  onCancel,
  onSubmit,
  isSaving,
  error,
  success,
  hasUnsavedChanges,
}: {
  student: User;
  draft: StudentProfileDraft;
  onDraftChange: <K extends keyof StudentProfileDraft>(
    key: K,
    value: StudentProfileDraft[K]
  ) => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSaving: boolean;
  error: string | null;
  success: string | null;
  hasUnsavedChanges: boolean;
}) {
  const profile = buildProfileFromUser({
    ...student,
    ...buildUpdatePayload(draft),
    description: draft.description,
    tags: parseTags(draft.tagsText),
  });

  const age = profile.age ? `${profile.age} år` : "Ej angivet";
  const verificationBadge = student.verifiedStudent
    ? {
        text: "Verifierad student",
        Icon: ShieldCheck,
        className:
          "border-emerald-200/80 bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-500/10",
      }
    : {
        text: "Ej verifierad",
        Icon: AlertTriangle,
        className:
          "border-amber-200/80 bg-white text-amber-700 shadow-sm ring-1 ring-amber-500/10",
      };

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <section className="w-full">
        <div className="relative h-[220px] w-full overflow-hidden rounded-2xl bg-gray-100 sm:h-[280px] md:h-[340px]">
          {profile.bannerUrl ? (
            <img
              src={profile.bannerUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-[linear-gradient(135deg,#f8fafc_0%,#eef2f7_100%)]" />
          )}
        </div>

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <div className="relative -mt-14 mb-4 sm:-mt-24">
            <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg sm:h-36 sm:w-36">
              {profile.logoUrl ? (
                <img
                  src={profile.logoUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-50 text-4xl font-semibold text-gray-500 sm:text-5xl">
                  {profile.displayName?.trim().charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    aria-label="Förnamn"
                    value={draft.firstName}
                    onChange={(event) =>
                      onDraftChange("firstName", event.target.value)
                    }
                    className={`${inlineInputClass} text-2xl font-bold text-gray-900 sm:text-3xl`}
                    placeholder="Förnamn"
                  />
                  <input
                    aria-label="Efternamn"
                    value={draft.surname}
                    onChange={(event) =>
                      onDraftChange("surname", event.target.value)
                    }
                    className={`${inlineInputClass} text-2xl font-bold text-gray-900 sm:text-3xl`}
                    placeholder="Efternamn"
                  />
                </div>

                <span
                  className={`inline-flex h-7 items-center gap-2 rounded-full border py-1 pl-2 pr-3 text-xs font-medium ${verificationBadge.className}`}
                >
                  <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-current/10">
                    <verificationBadge.Icon className="h-3.5 w-3.5" />
                  </span>
                  <span>{verificationBadge.text}</span>
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                <label className="inline-flex min-w-[180px] flex-1 items-center gap-1.5">
                  <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                  <input
                    aria-label="Stad"
                    value={draft.city}
                    onChange={(event) =>
                      onDraftChange("city", event.target.value)
                    }
                    className={`${inlineInputClass} w-full text-sm text-gray-700`}
                    placeholder="Stad"
                  />
                </label>
                <label className="inline-flex min-w-[220px] flex-1 items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 shrink-0 text-gray-400" />
                  <input
                    aria-label="Skola"
                    value={draft.schoolName}
                    onChange={(event) =>
                      onDraftChange("schoolName", event.target.value)
                    }
                    className={`${inlineInputClass} w-full text-sm text-gray-700`}
                    placeholder="Skola"
                  />
                </label>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
                isDisabled={isSaving}
              >
                <X className="h-4 w-4" />
                Avbryt
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={isSaving}
                isDisabled={isSaving || !hasUnsavedChanges}
              >
                <Save className="h-4 w-4" />
                Spara profil
              </Button>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
            <div className="space-y-6">
              <section className={editPanelClass}>
                <h2 className="mb-3 text-lg font-semibold text-gray-900">
                  Om mig
                </h2>
                <textarea
                  aria-label="Om mig"
                  value={draft.description}
                  onChange={(event) =>
                    onDraftChange("description", event.target.value)
                  }
                  className={`${inlineInputClass} min-h-44 w-full resize-y text-base leading-relaxed text-gray-600`}
                  placeholder="Berätta lite om dig själv"
                />
              </section>

              <section className={editPanelClass}>
                <h2 className="mb-3 text-lg font-semibold text-gray-900">
                  Jag söker
                </h2>
                <div className="space-y-3">
                  <input
                    aria-label="Önskat område"
                    value={draft.preferredArea}
                    onChange={(event) =>
                      onDraftChange("preferredArea", event.target.value)
                    }
                    className={`${inlineInputClass} w-full text-sm text-gray-700`}
                    placeholder="Område eller stad du söker boende i"
                  />
                  <input
                    aria-label="Taggar"
                    value={draft.tagsText}
                    onChange={(event) =>
                      onDraftChange("tagsText", event.target.value)
                    }
                    className={`${inlineInputClass} w-full text-sm text-gray-700`}
                    placeholder="Taggar separerade med komma"
                  />
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <section className={editPanelClass}>
                <h2 className="mb-3 text-lg font-semibold text-gray-900">
                  Kontakt
                </h2>
                <div className="grid gap-3">
                  <EditableRow
                    icon={<Mail className="h-4 w-4 shrink-0 text-gray-400" />}
                    label="E-post"
                    type="email"
                    value={draft.email}
                    onChange={(value) => onDraftChange("email", value)}
                    placeholder="namn@example.com"
                  />
                  <EditableRow
                    icon={<Phone className="h-4 w-4 shrink-0 text-gray-400" />}
                    label="Telefon"
                    type="tel"
                    value={draft.phone}
                    onChange={(value) => onDraftChange("phone", value)}
                    placeholder="070-123 45 67"
                  />
                </div>
              </section>

              <section className={editPanelClass}>
                <InlineLabel>Sociala länkar</InlineLabel>
                <div className="mt-3 grid gap-3">
                  <EditableRow
                    icon={
                      <Linkedin className="h-4 w-4 shrink-0 text-gray-400" />
                    }
                    label="LinkedIn"
                    type="url"
                    value={draft.linkedInUrl}
                    onChange={(value) => onDraftChange("linkedInUrl", value)}
                    placeholder="https://linkedin.com/in/..."
                  />
                  <EditableRow
                    icon={
                      <Instagram className="h-4 w-4 shrink-0 text-gray-400" />
                    }
                    label="Instagram"
                    type="url"
                    value={draft.instagramUrl}
                    onChange={(value) => onDraftChange("instagramUrl", value)}
                    placeholder="https://instagram.com/..."
                  />
                  <EditableRow
                    icon={
                      <Facebook className="h-4 w-4 shrink-0 text-gray-400" />
                    }
                    label="Facebook"
                    type="url"
                    value={draft.facebookUrl}
                    onChange={(value) => onDraftChange("facebookUrl", value)}
                    placeholder="https://facebook.com/..."
                  />
                </div>
              </section>

              <section className={editPanelClass}>
                <h2 className="mb-3 text-lg font-semibold text-gray-900">
                  Snabbfakta
                </h2>
                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white/70">
                  <div className="divide-y divide-gray-200">
                    <EditableFactRow label="Ålder" value={age} readOnly />
                    <EditableFactRow
                      label="Skola"
                      value={draft.schoolName}
                      onChange={(value) => onDraftChange("schoolName", value)}
                      placeholder="Ej angivet"
                    />
                    <EditableFactRow
                      label="Utbildning"
                      value={draft.studyProgram}
                      onChange={(value) =>
                        onDraftChange("studyProgram", value)
                      }
                      placeholder="Ej angivet"
                    />
                    <EditableFactRow
                      label="Studietakt"
                      value={draft.studyPace}
                      onChange={(value) => onDraftChange("studyPace", value)}
                      placeholder="Ej angivet"
                    />
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </section>

      <div className="sticky bottom-4 z-10 mx-auto flex w-full max-w-5xl flex-col gap-3 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          {hasUnsavedChanges ? (
            <span className="inline-flex w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              Osparade ändringar
            </span>
          ) : (
            <span className="text-sm text-gray-500">Inga lokala ändringar.</span>
          )}
          {error && <span className="text-sm text-red-600">{error}</span>}
          {success && (
            <span className="inline-flex items-center gap-1 text-sm text-green-700">
              <Check className="h-4 w-4" />
              {success}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            isDisabled={isSaving}
          >
            Avbryt
          </Button>
          <Button
            type="submit"
            isLoading={isSaving}
            isDisabled={isSaving || !hasUnsavedChanges}
          >
            <Save className="h-4 w-4" />
            Spara profil
          </Button>
        </div>
      </div>
    </form>
  );
}

export default function Page() {
  const { token, isLoading: authLoading, updateUser } = useAuth();
  const [student, setStudent] = useState<User | null>(null);
  const [draft, setDraft] = useState<StudentProfileDraft | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !token) {
      if (!token) {
        setStudent(null);
        setDraft(null);
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
        if (!cancelled) {
          setStudent(currentUser);
          setDraft(buildDraftFromUser(currentUser));
        }
      } catch (err) {
        if (!cancelled) {
          setStudent(null);
          setDraft(null);
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

  const savedSnapshot = useMemo(
    () => (student ? getDraftSnapshot(buildDraftFromUser(student)) : ""),
    [student]
  );

  const hasUnsavedChanges = useMemo(
    () => getDraftSnapshot(draft) !== savedSnapshot,
    [draft, savedSnapshot]
  );

  const updateDraftField = <K extends keyof StudentProfileDraft>(
    key: K,
    value: StudentProfileDraft[K]
  ) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
    setSaveError(null);
    setSaveSuccess(null);
  };

  const startEditMode = () => {
    if (!student) return;
    setDraft(buildDraftFromUser(student));
    setSaveError(null);
    setSaveSuccess(null);
    setEditMode(true);
  };

  const cancelEditMode = () => {
    if (student) setDraft(buildDraftFromUser(student));
    setSaveError(null);
    setSaveSuccess(null);
    setEditMode(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft || !student) return;

    setSavingProfile(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const updatedUser = await updateUser(buildUpdatePayload(draft));
      const mergedUser = {
        ...student,
        ...updatedUser,
        description: updatedUser.description ?? draft.description,
        tags: updatedUser.tags ?? parseTags(draft.tagsText),
        schoolName: updatedUser.schoolName ?? draft.schoolName,
        studyProgram: updatedUser.studyProgram ?? draft.studyProgram,
        studyPace: updatedUser.studyPace ?? draft.studyPace,
        preferredArea: updatedUser.preferredArea ?? draft.preferredArea,
        linkedInUrl: updatedUser.linkedInUrl ?? draft.linkedInUrl,
        instagramUrl: updatedUser.instagramUrl ?? draft.instagramUrl,
        facebookUrl: updatedUser.facebookUrl ?? draft.facebookUrl,
      } as User;

      setStudent(mergedUser);
      setDraft(buildDraftFromUser(mergedUser));
      setEditMode(false);
      setSaveSuccess("Profilen har sparats.");
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Kunde inte spara profilen."
      );
    } finally {
      setSavingProfile(false);
    }
  };

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

  if (!student || !draft) {
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
      {editMode ? (
        <EditableStudentProfile
          student={student}
          draft={draft}
          onDraftChange={updateDraftField}
          onCancel={cancelEditMode}
          onSubmit={handleSubmit}
          isSaving={savingProfile}
          error={saveError}
          success={saveSuccess}
          hasUnsavedChanges={hasUnsavedChanges}
        />
      ) : (
        <>
          {saveSuccess && (
            <div className="mx-auto mb-4 max-w-4xl rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {saveSuccess}
            </div>
          )}
          <ProfileHero student={profile} onEditProfile={startEditMode} />
        </>
      )}
      <ProfileDocumentsSection />
    </main>
  );
}
