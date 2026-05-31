"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import ProfileHero, {
  type StudentProfileExtended,
} from "@/features/students/components/ProfileHero";
import ProfileDocumentsSection from "@/features/students/components/ProfileDocumentsSection";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getUserDisplayName } from "@/lib/user-display";
import { authService } from "@/features/auth/services/auth-service";
import type { Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";
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

const buildProfileFromUser = (user: User, locale: Locale = "sv"): StudentProfileExtended => {
  const fullName = getUserDisplayName(user);
  const city = getCityValue(user.city);
  const studyProgram = user.studyProgram ?? user.tags?.[0] ?? localizedText(locale, "Ej angivet", "Not specified");
  const preferredArea = user.preferredArea ?? city;

  return {
    ...user,
    city,
    displayName: fullName,
    headline: user.schoolName || city || "Student",
    stats: {
      studyProgram,
      studyPace: user.studyPace ?? localizedText(locale, "Ej angivet", "Not specified"),
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
  const { locale } = useI18n();
  const profile = buildProfileFromUser({
    ...student,
    ...buildUpdatePayload(draft),
    description: draft.description,
    tags: parseTags(draft.tagsText),
  }, locale);

  const age = profile.age
    ? localizedText(locale, `${profile.age} år`, `${profile.age} years`)
    : localizedText(locale, "Ej angivet", "Not specified");
  const verificationBadge = student.verifiedStudent
    ? {
        text: localizedText(locale, "Verifierad student", "Verified student"),
        Icon: ShieldCheck,
        className:
          "border-emerald-200/80 bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-500/10",
      }
    : {
        text: localizedText(locale, "Ej verifierad", "Not verified"),
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
                    aria-label={localizedText(locale, "Förnamn", "First name")}
                    value={draft.firstName}
                    onChange={(event) =>
                      onDraftChange("firstName", event.target.value)
                    }
                    className={`${inlineInputClass} text-2xl font-bold text-gray-900 sm:text-3xl`}
                    placeholder={localizedText(locale, "Förnamn", "First name")}
                  />
                  <input
                    aria-label={localizedText(locale, "Efternamn", "Last name")}
                    value={draft.surname}
                    onChange={(event) =>
                      onDraftChange("surname", event.target.value)
                    }
                    className={`${inlineInputClass} text-2xl font-bold text-gray-900 sm:text-3xl`}
                    placeholder={localizedText(locale, "Efternamn", "Last name")}
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
                    aria-label={localizedText(locale, "Stad", "City")}
                    value={draft.city}
                    onChange={(event) =>
                      onDraftChange("city", event.target.value)
                    }
                    className={`${inlineInputClass} w-full text-sm text-gray-700`}
                    placeholder={localizedText(locale, "Stad", "City")}
                  />
                </label>
                <label className="inline-flex min-w-[220px] flex-1 items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 shrink-0 text-gray-400" />
                  <input
                    aria-label={localizedText(locale, "Skola", "School")}
                    value={draft.schoolName}
                    onChange={(event) =>
                      onDraftChange("schoolName", event.target.value)
                    }
                    className={`${inlineInputClass} w-full text-sm text-gray-700`}
                    placeholder={localizedText(locale, "Skola", "School")}
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
                {localizedText(locale, "Avbryt", "Cancel")}
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={isSaving}
                isDisabled={isSaving || !hasUnsavedChanges}
              >
                <Save className="h-4 w-4" />
                {localizedText(locale, "Spara profil", "Save profile")}
              </Button>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
            <div className="space-y-6">
              <section className={editPanelClass}>
                <h2 className="mb-3 text-lg font-semibold text-gray-900">
                  {localizedText(locale, "Om mig", "About me")}
                </h2>
                <textarea
                  aria-label={localizedText(locale, "Om mig", "About me")}
                  value={draft.description}
                  onChange={(event) =>
                    onDraftChange("description", event.target.value)
                  }
                  className={`${inlineInputClass} min-h-44 w-full resize-y text-base leading-relaxed text-gray-600`}
                  placeholder={localizedText(locale, "Berätta lite om dig själv", "Tell us a little about yourself")}
                />
              </section>

              <section className={editPanelClass}>
                <h2 className="mb-3 text-lg font-semibold text-gray-900">
                  {localizedText(locale, "Jag söker", "I am looking for")}
                </h2>
                <div className="space-y-3">
                  <input
                    aria-label={localizedText(locale, "Önskat område", "Preferred area")}
                    value={draft.preferredArea}
                    onChange={(event) =>
                      onDraftChange("preferredArea", event.target.value)
                    }
                    className={`${inlineInputClass} w-full text-sm text-gray-700`}
                    placeholder={localizedText(locale, "Område eller stad du söker boende i", "Area or city where you are looking for housing")}
                  />
                  <input
                    aria-label={localizedText(locale, "Taggar", "Tags")}
                    value={draft.tagsText}
                    onChange={(event) =>
                      onDraftChange("tagsText", event.target.value)
                    }
                    className={`${inlineInputClass} w-full text-sm text-gray-700`}
                    placeholder={localizedText(locale, "Taggar separerade med komma", "Tags separated by commas")}
                  />
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <section className={editPanelClass}>
                <h2 className="mb-3 text-lg font-semibold text-gray-900">
                  {localizedText(locale, "Kontakt", "Contact")}
                </h2>
                <div className="grid gap-3">
                  <EditableRow
                    icon={<Mail className="h-4 w-4 shrink-0 text-gray-400" />}
                    label={localizedText(locale, "E-post", "Email")}
                    type="email"
                    value={draft.email}
                    onChange={(value) => onDraftChange("email", value)}
                    placeholder="namn@example.com"
                  />
                  <EditableRow
                    icon={<Phone className="h-4 w-4 shrink-0 text-gray-400" />}
                    label={localizedText(locale, "Telefon", "Phone")}
                    type="tel"
                    value={draft.phone}
                    onChange={(value) => onDraftChange("phone", value)}
                    placeholder="070-123 45 67"
                  />
                </div>
              </section>

              <section className={editPanelClass}>
                <InlineLabel>{localizedText(locale, "Sociala länkar", "Social links")}</InlineLabel>
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
                  {localizedText(locale, "Snabbfakta", "Quick facts")}
                </h2>
                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white/70">
                  <div className="divide-y divide-gray-200">
                    <EditableFactRow label={localizedText(locale, "Ålder", "Age")} value={age} readOnly />
                    <EditableFactRow
                      label={localizedText(locale, "Skola", "School")}
                      value={draft.schoolName}
                      onChange={(value) => onDraftChange("schoolName", value)}
                      placeholder={localizedText(locale, "Ej angivet", "Not specified")}
                    />
                    <EditableFactRow
                      label={localizedText(locale, "Utbildning", "Education")}
                      value={draft.studyProgram}
                      onChange={(value) =>
                        onDraftChange("studyProgram", value)
                      }
                      placeholder={localizedText(locale, "Ej angivet", "Not specified")}
                    />
                    <EditableFactRow
                      label={localizedText(locale, "Studietakt", "Study pace")}
                      value={draft.studyPace}
                      onChange={(value) => onDraftChange("studyPace", value)}
                      placeholder={localizedText(locale, "Ej angivet", "Not specified")}
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
              {localizedText(locale, "Osparade ändringar", "Unsaved changes")}
            </span>
          ) : (
            <span className="text-sm text-gray-500">{localizedText(locale, "Inga lokala ändringar.", "No local changes.")}</span>
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
            {localizedText(locale, "Avbryt", "Cancel")}
          </Button>
          <Button
            type="submit"
            isLoading={isSaving}
            isDisabled={isSaving || !hasUnsavedChanges}
          >
            <Save className="h-4 w-4" />
            {localizedText(locale, "Spara profil", "Save profile")}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default function Page() {
  const router = useRouter();
  const { locale, localizedHref } = useI18n();
  const { token, isLoading: authLoading, updateUser } = useAuth();
  const [student, setStudent] = useState<User | null>(null);
  const [draft, setDraft] = useState<StudentProfileDraft | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [startingIdentityVerification, setStartingIdentityVerification] =
    useState(false);
  const [startingEmailVerification, setStartingEmailVerification] =
    useState(false);

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
              : localizedText(locale, "Kunde inte hämta profilen från backend.", "Could not load the profile from the backend.")
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
  }, [authLoading, locale, token]);

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
      setSaveSuccess(localizedText(locale, "Profilen har sparats.", "The profile has been saved."));
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : localizedText(locale, "Kunde inte spara profilen.", "Could not save the profile.")
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const startIdentityVerification = async () => {
    if (startingIdentityVerification) return;

    setStartingIdentityVerification(true);
    setSaveError(null);

    try {
      const response = await authService.verifyIdentity();
      router.push(
        localizedHref(`/registrera/freja-id?flow=identity&authRef=${encodeURIComponent(
          response.authRef
        )}`)
      );
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : localizedText(locale, "Kunde inte starta Freja-verifieringen.", "Could not start Freja verification.")
      );
    } finally {
      setStartingIdentityVerification(false);
    }
  };

  const startEmailVerification = async () => {
    if (startingEmailVerification) return;

    const email = student?.email?.trim();
    if (!email) {
      setSaveError(localizedText(locale, "Profilen saknar e-postadress.", "The profile is missing an email address."));
      return;
    }

    setStartingEmailVerification(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      await authService.verifyEmail({ email });
      setSaveSuccess(localizedText(locale, "Verifieringsmail är skickat.", "The verification email has been sent."));
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : localizedText(locale, "Kunde inte skicka verifieringsmail.", "Could not send the verification email.")
      );
    } finally {
      setStartingEmailVerification(false);
    }
  };

  if (authLoading || (token && loadingProfile && !student)) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        {localizedText(locale, "Hämtar profil från backend...", "Loading profile from the backend...")}
      </div>
    );
  }

  if (!token) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        {localizedText(locale, "Logga in för att se din profil.", "Log in to view your profile.")}
      </div>
    );
  }

  if (error) {
    return <div className="p-10 text-center text-destructive">{error}</div>;
  }

  if (!student || !draft) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        {localizedText(locale, "Ingen profil kunde laddas.", "No profile could be loaded.")}
      </div>
    );
  }

  if (student.accountType !== "student") {
    return (
      <div className="p-10 text-center text-muted-foreground">
        {localizedText(locale, "Den här profilsidan finns bara för studentkonton.", "This profile page is only for student accounts.")}
      </div>
    );
  }

  const profile = buildProfileFromUser(student, locale);
  const needsIdentityVerification =
    !student.verifiedIdentity && !student.verifiedStudent;
  const needsEmailVerification = !student.verifiedEmail;

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
          {saveError && (
            <div className="mx-auto mb-4 max-w-4xl rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {saveError}
            </div>
          )}
          {needsIdentityVerification && (
            <div className="mx-auto mb-4 flex max-w-4xl flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between">
              <span>{localizedText(locale, "Verifiera din identitet med Freja för att markera studentprofilen som verifierad.", "Verify your identity with Freja to mark the student profile as verified.")}</span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                isLoading={startingIdentityVerification}
                isDisabled={startingIdentityVerification}
                onPress={startIdentityVerification}
              >
                <ShieldCheck className="h-4 w-4" />
                {localizedText(locale, "Verifiera med Freja", "Verify with Freja")}
              </Button>
            </div>
          )}
          {needsEmailVerification && (
            <div className="mx-auto mb-4 flex max-w-4xl flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 sm:flex-row sm:items-center sm:justify-between">
              <span>{localizedText(locale, "Verifiera din e-postadress för att säkra kontot.", "Verify your email address to secure the account.")}</span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                isLoading={startingEmailVerification}
                isDisabled={startingEmailVerification}
                onPress={startEmailVerification}
              >
                <Mail className="h-4 w-4" />
                {localizedText(locale, "Skicka verifieringsmail", "Send verification email")}
              </Button>
            </div>
          )}
          <ProfileHero student={profile} onEditProfile={startEditMode} />
        </>
      )}
      <ProfileDocumentsSection />
    </main>
  );
}
