"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import {
  companyService,
  type CompanyChangeableDataDTO,
  type CompanyPrivateDTO,
} from "@/services/company";
import { queueService } from "@/services/queue-service";
import { type HousingQueueDTO } from "@/types/queue";
import {
  Facebook,
  Globe,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  Share2,
} from "lucide-react";
import { UploadButton } from "../../_components/UploadButton";

type ProfileDraft = {
  companyId: number;
  name: string;
  subtitle: string;
  description: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  logoUrl: string;
  bannerUrl: string;
  facebook: string;
  linkedin: string;
  orgNumber: string;
  internalContactNote: string;
};

const inlineInputClass =
  "min-w-0 rounded-md border border-[#004225]/10 bg-[#004225]/[0.035] px-2 py-1 outline-none transition hover:border-[#004225]/25 hover:bg-white focus:border-[#004225] focus:bg-white focus:ring-4 focus:ring-[#004225]/10";

const iconInputClass =
  "min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition hover:border-[#004225]/30 focus:border-[#004225] focus:ring-4 focus:ring-[#004225]/10";

function buildInitialDraft(
  companyId: number,
  companyData: CompanyPrivateDTO,
  firstQueue: HousingQueueDTO | undefined
): ProfileDraft {
  return {
    companyId,
    name: companyData.name ?? "",
    subtitle: companyData.subtitle ?? "",
    description: companyData.description ?? "",
    website: companyData.website ?? "",
    contactEmail: companyData.contactEmail ?? companyData.email ?? "",
    contactPhone: companyData.contactPhone ?? companyData.phone ?? "",
    logoUrl: companyData.logoUrl ?? "",
    bannerUrl: companyData.bannerUrl ?? "",
    facebook: firstQueue?.socialLinks?.facebook ?? "",
    linkedin: firstQueue?.socialLinks?.linkedin ?? "",
    orgNumber:
      companyData.orgNumber ??
      companyData.organisationNumber ??
      companyData.organizationNumber ??
      "",
    internalContactNote: companyData.internalContactNote ?? "",
  };
}

function getProfileSnapshot(draft: ProfileDraft | null) {
  if (!draft) return "";

  return JSON.stringify({
    name: draft.name,
    subtitle: draft.subtitle,
    description: draft.description,
    website: draft.website,
    contactEmail: draft.contactEmail,
    contactPhone: draft.contactPhone,
    logoUrl: draft.logoUrl,
    bannerUrl: draft.bannerUrl,
    facebook: draft.facebook,
    linkedin: draft.linkedin,
    orgNumber: draft.orgNumber,
    internalContactNote: draft.internalContactNote,
  });
}

function toNullableString(value: string) {
  return value.trim();
}

function isLocalObjectUrl(value: string) {
  return value.startsWith("blob:");
}

function buildCompanyChangePayload(draft: ProfileDraft): CompanyChangeableDataDTO {
  return {
    logoUrl: isLocalObjectUrl(draft.logoUrl) ? undefined : toNullableString(draft.logoUrl),
    bannerUrl: isLocalObjectUrl(draft.bannerUrl) ? undefined : toNullableString(draft.bannerUrl),
    companyDescription: toNullableString(draft.description),
    phone: toNullableString(draft.contactPhone),
    contactEmail: toNullableString(draft.contactEmail),
    companyUrl: toNullableString(draft.website),
    socialLinkByPlatform: {
      facebook: toNullableString(draft.facebook),
      linkedin: toNullableString(draft.linkedin),
    },
  };
}

function mergeSavedCompany(
  company: CompanyPrivateDTO | null,
  draft: ProfileDraft
): CompanyPrivateDTO {
  return {
    ...(company ?? {
      id: draft.companyId,
      name: draft.name,
    }),
    description: draft.description,
    website: draft.website,
    contactEmail: draft.contactEmail,
    contactPhone: draft.contactPhone,
    phone: draft.contactPhone,
    logoUrl: isLocalObjectUrl(draft.logoUrl)
      ? company?.logoUrl ?? ""
      : draft.logoUrl,
    bannerUrl: isLocalObjectUrl(draft.bannerUrl)
      ? company?.bannerUrl ?? ""
      : draft.bannerUrl,
  };
}

function InlineLabel({ children }: { children: string }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
      {children}
    </span>
  );
}

function EditableContactRow({
  icon,
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  placeholder: string;
  type?: string;
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
        className={iconInputClass}
        placeholder={placeholder}
      />
    </label>
  );
}

function EditableCompanyPreview({
  draft,
  companyQueue,
  onDraftChange,
  onImageSelect,
}: {
  draft: ProfileDraft;
  companyQueue: HousingQueueDTO | null;
  onDraftChange: <K extends keyof ProfileDraft>(
    key: K,
    value: ProfileDraft[K]
  ) => void;
  onImageSelect: (field: "logoUrl" | "bannerUrl", file: File) => void;
}) {
  return (
    <section
      aria-label="Förhandsvisning av företagsprofil"
      className="mx-auto flex w-full max-w-6xl flex-col gap-8"
    >
      <div className="relative">
        <div className="relative h-[220px] w-full overflow-hidden rounded-2xl bg-gray-100 sm:h-[280px] md:h-[340px]">
          {draft.bannerUrl ? (
            <img
              src={draft.bannerUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-[linear-gradient(135deg,#f8fafc_0%,#eef2f7_100%)]" />
          )}
        </div>

        <UploadButton
          type="button"
          variant="outline"
          onFileSelect={(file) => onImageSelect("bannerUrl", file)}
          className="absolute right-4 top-4 bg-white/95 shadow-sm backdrop-blur"
        >
          <Pencil className="h-4 w-4" />
          Omslagsbild
        </UploadButton>
      </div>

      <section className="relative rounded-3xl border border-black/5 bg-white/80 px-4 pb-8 shadow-[0_18px_45px_rgba(0,0,0,0.05)] sm:px-6">
        <div className="relative -mt-14 mb-4 sm:-mt-24">
          <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg sm:h-36 sm:w-36">
            {draft.logoUrl ? (
              <img
                src={draft.logoUrl}
                alt=""
                className="h-full w-full object-contain p-2"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-50 text-4xl font-semibold text-gray-500 sm:text-5xl">
                {draft.name.trim().charAt(0).toUpperCase() || "?"}
              </div>
            )}

            <UploadButton
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label="Redigera logga"
              title="Redigera logga"
              onFileSelect={(file) => onImageSelect("logoUrl", file)}
              className="absolute right-1 top-1 min-w-0 bg-white/95 shadow-sm backdrop-blur"
            >
              <Pencil className="h-4 w-4" />
            </UploadButton>
          </div>
        </div>

        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {draft.name || "Företagsprofil"}
            </h2>

            {draft.subtitle ? (
              <p className="mt-2 text-sm font-medium text-gray-600 sm:text-base">
                {draft.subtitle}
              </p>
            ) : null}

            {companyQueue?.city && (
              <div className="mt-3 flex items-center gap-1.5 text-sm text-gray-600">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                <span>{companyQueue.city}</span>
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-400">
              <Facebook className="h-[18px] w-[18px]" />
            </span>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-400">
              <Linkedin className="h-[18px] w-[18px]" />
            </span>
            <div className="mx-0.5 h-5 w-px bg-gray-200" />
            <button
              type="button"
              disabled
              aria-label="Dela"
              title="Dela"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-300"
            >
              <Share2 className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-2">
          <InlineLabel>Sociala länkar</InlineLabel>
          <div className="grid gap-3 lg:grid-cols-2">
            <EditableContactRow
              icon={<Facebook className="h-4 w-4 shrink-0 text-gray-400" />}
              label="Facebook"
              value={draft.facebook}
              onChange={(value) => onDraftChange("facebook", value)}
              placeholder="https://facebook.com/..."
            />
            <EditableContactRow
              icon={<Linkedin className="h-4 w-4 shrink-0 text-gray-400" />}
              label="LinkedIn"
              value={draft.linkedin}
              onChange={(value) => onDraftChange("linkedin", value)}
              placeholder="https://linkedin.com/company/..."
            />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Om oss</h2>
          <textarea
            aria-label="Om oss"
            value={draft.description}
            onChange={(event) => onDraftChange("description", event.target.value)}
            className={`${inlineInputClass} min-h-40 w-full resize-y text-base leading-relaxed text-gray-600`}
            placeholder="Beskriv företaget"
          />
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Kontakt</h2>
          <div className="grid gap-3 lg:grid-cols-3">
            <EditableContactRow
              icon={<Phone className="h-4 w-4 shrink-0 text-gray-400" />}
              label="Kontakt telefon"
              value={draft.contactPhone}
              onChange={(value) => onDraftChange("contactPhone", value)}
              placeholder="070-000 00 00"
            />
            <EditableContactRow
              icon={<Mail className="h-4 w-4 shrink-0 text-gray-400" />}
              label="Kontakt e-post"
              type="email"
              value={draft.contactEmail}
              onChange={(value) => onDraftChange("contactEmail", value)}
              placeholder="kontakt@foretag.se"
            />
            <EditableContactRow
              icon={<Globe className="h-4 w-4 shrink-0 text-gray-400" />}
              label="Hemsida"
              type="url"
              value={draft.website}
              onChange={(value) => onDraftChange("website", value)}
              placeholder="https://"
            />
          </div>
        </div>
      </section>
    </section>
  );
}

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const previewImageUrlsRef = useRef<{
    logoUrl: string | null;
    bannerUrl: string | null;
  }>({
    logoUrl: null,
    bannerUrl: null,
  });

  const [company, setCompany] = useState<CompanyPrivateDTO | null>(null);
  const [companyQueue, setCompanyQueue] = useState<HousingQueueDTO | null>(null);
  const [draft, setDraft] = useState<ProfileDraft | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const companyId = getActiveCompanyId(user);

  useEffect(() => {
    return () => {
      const previewImageUrls = previewImageUrlsRef.current;
      if (previewImageUrls.logoUrl) {
        URL.revokeObjectURL(previewImageUrls.logoUrl);
      }
      if (previewImageUrls.bannerUrl) {
        URL.revokeObjectURL(previewImageUrls.bannerUrl);
      }
    };
  }, []);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    if (companyId == null || Number.isNaN(companyId)) {
      setError("Ogiltigt företags-ID.");
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    Promise.all([
      companyService.privateProfile(companyId),
      queueService.getByCompany(companyId),
    ])
      .then(([companyData, companyQueues]) => {
        if (!active) return;

        const normalizedQueues = Array.isArray(companyQueues) ? companyQueues : [];
        const firstQueue = normalizedQueues[0];

        setCompany(companyData);
        setCompanyQueue(firstQueue ?? null);
        setDraft(buildInitialDraft(companyId, companyData, firstQueue));
      })
      .catch((fetchError) => {
        if (!active) return;

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Kunde inte ladda företagsprofilen."
        );
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, companyId, user]);

  const savedSnapshot = useMemo(() => {
    if (!company || !draft) return "";
    return getProfileSnapshot(
      buildInitialDraft(draft.companyId, company, companyQueue ?? undefined)
    );
  }, [company, companyQueue, draft]);

  const hasUnsavedChanges = useMemo(
    () => getProfileSnapshot(draft) !== savedSnapshot,
    [draft, savedSnapshot]
  );

  const updateDraftField = <K extends keyof ProfileDraft>(
    key: K,
    value: ProfileDraft[K]
  ) => {
    setSaveMessage(null);
    setDraft((current) => {
      if (!current) return current;
      return { ...current, [key]: value };
    });
  };

  const handleImageSelect = (field: "logoUrl" | "bannerUrl", file: File) => {
    const previousPreview = previewImageUrlsRef.current[field];
    if (previousPreview) {
      URL.revokeObjectURL(previousPreview);
    }

    const localPreviewUrl = URL.createObjectURL(file);
    previewImageUrlsRef.current[field] = localPreviewUrl;
    updateDraftField(field, localPreviewUrl);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft || saving) return;

    setSaving(true);
    setError(null);
    setSaveMessage(null);

    try {
      await companyService.updateCompanyData(
        draft.companyId,
        buildCompanyChangePayload(draft)
      );

      const savedCompany = mergeSavedCompany(company, draft);
      const savedQueue = companyQueue
        ? {
            ...companyQueue,
            socialLinks: {
              ...companyQueue.socialLinks,
              facebook: draft.facebook,
              linkedin: draft.linkedin,
            },
          }
        : companyQueue;

      setCompany(savedCompany);
      setCompanyQueue(savedQueue);
      setDraft(buildInitialDraft(draft.companyId, savedCompany, savedQueue ?? undefined));
      setSaveMessage("Företagsprofilen har sparats.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Kunde inte spara företagsprofilen."
      );
    } finally {
      setSaving(false);
    }
  };

  const resetDraft = () => {
    if (!company || !draft) return;
    const previewImageUrls = previewImageUrlsRef.current;
    if (previewImageUrls.logoUrl) {
      URL.revokeObjectURL(previewImageUrls.logoUrl);
      previewImageUrls.logoUrl = null;
    }
    if (previewImageUrls.bannerUrl) {
      URL.revokeObjectURL(previewImageUrls.bannerUrl);
      previewImageUrls.bannerUrl = null;
    }
    setDraft(buildInitialDraft(draft.companyId, company, companyQueue ?? undefined));
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Laddar profil...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        Logga in för att hantera företagsprofilen.
      </div>
    );
  }

  if (companyId == null || Number.isNaN(companyId)) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        Denna profilsida gäller bara för företagskonton.
      </div>
    );
  }

  if (loading || !draft) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Hämtar företagsprofil...
      </div>
    );
  }

  return (
    <main className="pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Redigera profil</h1>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {saveMessage && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {saveMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6">
        <EditableCompanyPreview
          draft={draft}
          companyQueue={companyQueue}
          onDraftChange={updateDraftField}
          onImageSelect={handleImageSelect}
        />

        <div className="sticky bottom-4 z-10 mx-auto flex w-full max-w-6xl flex-col gap-3 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            {hasUnsavedChanges ? (
              <span className="inline-flex w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                Osparade ändringar
              </span>
            ) : (
              <span className="text-sm text-gray-500">Inga ändringar.</span>
            )}
          </div>

          <div className="ml-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            {hasUnsavedChanges && (
              <Button
                type="button"
                variant="outline"
                isDisabled={saving}
                onClick={resetDraft}
              >
                Återställ
              </Button>
            )}
            <Button
              type="submit"
              isDisabled={!hasUnsavedChanges || saving}
              isLoading={saving}
              title={
                hasUnsavedChanges
                  ? "Spara företagsprofilen"
                  : "Det finns inga ändringar att spara."
              }
            >
              {!saving && <Save className="h-4 w-4" />}
              {saving ? "Sparar..." : "Spara ändringar"}
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
