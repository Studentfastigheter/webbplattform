"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";
import { getActiveCompanyId } from "@/lib/company-access";
import {
  companyService,
  type CompanyChangeableDataDTO,
  type CompanyPrivateDTO,
  type CompanyPublicDTO,
  type SocialPlatform,
} from "@/features/companies/services/company-service";
import {
  useCompanyPrivate,
  useCompanyPublic,
  usePlatforms,
  useUpdateCompanyData,
  useUploadCompanyBanner,
  useUploadCompanyLogo,
} from "@/features/companies/hooks/useCompanies";
import { useQueuesByCompany } from "@/features/queues/hooks/useQueues";
import { type HousingQueueDTO } from "@/types/queue";
import { formatCityName } from "@/features/cities/city-utils";
import {
  Globe,
  ImageIcon,
  Link2,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Save,
  Share2,
  Trash2,
  Video,
} from "lucide-react";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa6";
import { UploadButton } from "../_components/shared/UploadButton";
import BannerImageCropDialog from "@/components/shared/BannerImageCropDialog";
import { COMPANY_BANNER_ASPECT_RATIO } from "@/lib/banner-image";
import { isYouTubeVideoUrl } from "@/lib/youtube-url";
import ImageUploadGallery from "@/features/business-portal/components/ImageUploadGallery";
import { useUploadCompanyPublicMedia } from "@/features/media/hooks/useMedia";

type ProfileDraft = {
  companyId: number;
  name: string;
  subtitle: string;
  description: string;
  websiteUrl: string;
  privacyPolicyUrl: string;
  termsUrl: string;
  contactEmail: string;
  contactPhone: string;
  cities: string[];
  logoUrl: string;
  bannerUrl: string;
  additionalSocialLinks: SocialLinkDraft[];
  pictureUrlList: string[];
  videoUrlList: string[];
  orgNumber: string;
  internalContactNote: string;
};

type SocialLinkDraft = {
  platform: string;
  url: string;
};

const inlineInputClass =
  "min-w-0 rounded-md border border-[#004225]/10 bg-[#004225]/[0.035] px-2 py-1 outline-none transition hover:border-[#004225]/25 hover:bg-white focus:border-[#004225] focus:bg-white focus:ring-4 focus:ring-[#004225]/10";

const iconInputClass =
  "min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition hover:border-[#004225]/30 focus:border-[#004225] focus:ring-4 focus:ring-[#004225]/10";

function platformKey(value: string) {
  return value.trim().toLowerCase();
}

function platformIconKey(value: string) {
  return platformKey(value).replace(/[^a-z0-9]/g, "");
}

function dedupeSocialPlatforms(platforms: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  platforms.forEach((platform) => {
    const trimmed = platform.trim();
    const key = platformKey(trimmed);
    if (!key || seen.has(key)) return;
    seen.add(key);
    result.push(trimmed);
  });

  return result;
}

function normalizeSocialPlatformOptions(platforms: SocialPlatform[]) {
  return dedupeSocialPlatforms(
    platforms
      .map((platform) => draftString(platform.platform))
      .filter(Boolean)
  );
}

function getSocialPlatformOptionsForLink(
  socialPlatformOptions: string[],
  selectedPlatform: string,
  links: SocialLinkDraft[]
) {
  const selectedKey = platformKey(selectedPlatform);
  const usedKeys = new Set(
    links
      .map((link) => platformKey(draftString(link.platform)))
      .filter((key) => key && key !== selectedKey)
  );

  return dedupeSocialPlatforms([...socialPlatformOptions, selectedPlatform])
    .filter((platform) => !usedKeys.has(platformKey(platform)));
}

function normalizeUrlList(values: string[] | undefined) {
  return (values ?? [])
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getInvalidYouTubeVideoUrls(values: string[] | undefined) {
  return normalizeUrlList(values).filter((url) => !isYouTubeVideoUrl(url));
}

function uniqueCityLabels(values: Array<string | null | undefined>) {
  const labels = new Map<string, string>();

  values.forEach((value) => {
    const label = formatCityName(value?.replace(/_/g, " ") ?? "");
    if (!label) return;
    labels.set(label.toLocaleLowerCase("sv-SE"), label);
  });

  return Array.from(labels.values());
}

function draftString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function buildAdditionalSocialLinks(
  socialLinks: Record<string, string> | undefined
): SocialLinkDraft[] {
  return Object.entries(socialLinks ?? {})
    .map(([platform, url]) => ({
      platform: platform.trim(),
      url: draftString(url).trim(),
    }));
}

function socialLinksToRecord(draft: ProfileDraft) {
  const socialLinks: Record<string, string> = {};

  draft.additionalSocialLinks.forEach((link) => {
    const platform = draftString(link.platform).trim();
    const url = draftString(link.url).trim();
    if (!platform || !url) return;
    socialLinks[platform] = url;
  });

  return socialLinks;
}

function withPublicProfileFields(
  companyData: CompanyPrivateDTO,
  publicCompanyData: CompanyPublicDTO | null
): CompanyPrivateDTO {
  if (!publicCompanyData) {
    return companyData;
  }

  return {
    ...companyData,
    logoUrl: companyData.logoUrl ?? publicCompanyData.logoUrl,
    bannerUrl: companyData.bannerUrl ?? publicCompanyData.bannerUrl,
    description: companyData.description ?? publicCompanyData.description,
    website: companyData.website ?? publicCompanyData.website,
    websiteUrl: companyData.websiteUrl ?? publicCompanyData.websiteUrl,
    privacyUrl: companyData.privacyUrl ?? publicCompanyData.privacyUrl,
    privacyPolicyUrl:
      companyData.privacyPolicyUrl ?? publicCompanyData.privacyPolicyUrl,
    termsUrl: companyData.termsUrl ?? publicCompanyData.termsUrl,
    pictureUrlList:
      companyData.pictureUrlList?.length
        ? companyData.pictureUrlList
        : publicCompanyData.pictureUrlList,
    videoUrlList:
      companyData.videoUrlList?.length
        ? companyData.videoUrlList
        : publicCompanyData.videoUrlList,
    socialLinks: publicCompanyData.socialLinks ?? companyData.socialLinks,
    cities: publicCompanyData.cities ?? companyData.cities,
  };
}

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
    websiteUrl: companyData.websiteUrl ?? companyData.website ?? "",
    privacyPolicyUrl:
      companyData.privacyPolicyUrl ?? companyData.privacyUrl ?? "",
    termsUrl: companyData.termsUrl ?? "",
    contactEmail: companyData.contactEmail ?? companyData.email ?? "",
    contactPhone: companyData.contactPhone ?? companyData.phone ?? "",
    cities: companyData.cities ?? [],
    logoUrl: companyData.logoUrl ?? "",
    bannerUrl: companyData.bannerUrl ?? "",
    additionalSocialLinks: buildAdditionalSocialLinks(
      companyData.socialLinks ?? firstQueue?.socialLinks
    ),
    pictureUrlList: normalizeUrlList(companyData.pictureUrlList),
    videoUrlList: normalizeUrlList(companyData.videoUrlList),
    orgNumber:
      companyData.orgNumber ??
      companyData.organisationNumber ??
      companyData.organizationNumber ??
      "",
    internalContactNote:
      companyData.internalContactNote ?? companyData.contactNote ?? "",
  };
}

function getProfileSnapshot(draft: ProfileDraft | null) {
  if (!draft) return "";

  return JSON.stringify({
    name: draft.name,
    ...buildCompanyChangePayload(draft),
    orgNumber: draft.orgNumber,
    internalContactNote: draft.internalContactNote,
  });
}

function getCompanyDataSnapshot(draft: ProfileDraft | null) {
  if (!draft) return "";

  return JSON.stringify(buildCompanyChangePayload(draft));
}

function toNullableString(value: string) {
  return value.trim();
}

function isLocalObjectUrl(value: string) {
  return value.startsWith("blob:");
}

function buildCompanyChangePayload(draft: ProfileDraft): CompanyChangeableDataDTO {
  return {
    logoUrl: toNullableString(draft.logoUrl),
    bannerUrl: toNullableString(draft.bannerUrl),
    companyDescription: toNullableString(draft.description),
    phone: toNullableString(draft.contactPhone),
    contactEmail: toNullableString(draft.contactEmail),
    subtitle: toNullableString(draft.subtitle),
    privacyPolicyUrl: toNullableString(draft.privacyPolicyUrl),
    termsUrl: toNullableString(draft.termsUrl),
    websiteUrl: toNullableString(draft.websiteUrl),
    pictureUrlList: normalizeUrlList(draft.pictureUrlList),
    videoUrlList: normalizeUrlList(draft.videoUrlList),
    socialLinks: socialLinksToRecord(draft),
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
    subtitle: draft.subtitle,
    description: draft.description,
    companyDescription: draft.description,
    website: draft.websiteUrl,
    websiteUrl: draft.websiteUrl,
    privacyPolicyUrl: draft.privacyPolicyUrl,
    termsUrl: draft.termsUrl,
    contactEmail: draft.contactEmail,
    contactPhone: draft.contactPhone,
    phone: draft.contactPhone,
    cities: company?.cities ?? draft.cities,
    logoUrl: isLocalObjectUrl(draft.logoUrl)
      ? company?.logoUrl ?? ""
      : draft.logoUrl,
    bannerUrl: isLocalObjectUrl(draft.bannerUrl)
      ? company?.bannerUrl ?? ""
      : draft.bannerUrl,
    socialLinks: socialLinksToRecord(draft),
    pictureUrlList: normalizeUrlList(draft.pictureUrlList),
    videoUrlList: normalizeUrlList(draft.videoUrlList),
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

function UrlListEditor({
  icon,
  label,
  values,
  placeholder,
  addLabel,
  emptyLabel,
  getIsInvalidValue,
  invalidText,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  values?: string[];
  placeholder: string;
  addLabel: string;
  emptyLabel: string;
  getIsInvalidValue?: (value: string) => boolean;
  invalidText?: string;
  onChange: (values: string[]) => void;
}) {
  const listValues = values ?? [];

  const updateValue = (index: number, value: string) => {
    onChange(listValues.map((entry, entryIndex) => (entryIndex === index ? value : entry)));
  };

  const removeValue = (index: number) => {
    onChange(listValues.filter((_, entryIndex) => entryIndex !== index));
  };

  return (
    <div className="grid gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-gray-700">
          {icon}
          {label}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...listValues, ""])}
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </Button>
      </div>

      {listValues.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-white px-3 py-4 text-sm text-gray-500">
          {emptyLabel}
        </div>
      ) : (
        <div className="grid gap-2">
          {listValues.map((value, index) => {
            const isInvalid = Boolean(
              value.trim() && getIsInvalidValue?.(value)
            );

            return (
              <div key={index} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <div className="grid gap-1">
                  <input
                    aria-invalid={isInvalid || undefined}
                    aria-label={`${label} ${index + 1}`}
                    type="url"
                    value={value}
                    onChange={(event) => updateValue(index, event.target.value)}
                    className={`${iconInputClass} ${
                      isInvalid
                        ? "border-red-300 text-red-700 focus:border-red-500 focus:ring-red-100"
                        : ""
                    }`}
                    placeholder={placeholder}
                  />
                  {isInvalid && invalidText ? (
                    <p className="text-xs font-medium text-red-600">
                      {invalidText}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Ta bort URL"
                  title="Ta bort URL"
                  onClick={() => removeValue(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ImageGalleryField({
  imageUrls,
  onOpen,
}: {
  imageUrls?: string[];
  onOpen: () => void;
}) {
  const { locale } = useI18n();
  const visibleImages = normalizeUrlList(imageUrls);

  return (
    <div className="grid gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-gray-700">
          <ImageIcon className="h-4 w-4 text-gray-400" />
          {localizedText(locale, "Bildgalleri", "Image gallery")}
        </span>
        <Button type="button" variant="outline" size="sm" onClick={onOpen}>
          <ImageIcon className="h-4 w-4" />
          {localizedText(locale, "Redigera bilder", "Edit images")}
        </Button>
      </div>

      {visibleImages.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-white px-3 py-4 text-sm text-gray-500">
          {localizedText(locale, "Inga bilder uppladdade.", "No images uploaded.")}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {visibleImages.slice(0, 8).map((imageUrl, index) => (
            <div key={`${imageUrl}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
              <img
                src={imageUrl}
                alt={localizedText(locale, `Bild ${index + 1}`, `Image ${index + 1}`)}
                className="h-full w-full object-cover"
              />
              {index === 0 && (
                <span className="absolute bottom-1 left-1 rounded-full bg-[#004225] px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                  {localizedText(locale, "Huvudbild", "Main")}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SocialPlatformIcon({ platform }: { platform: string }) {
  const key = platformIconKey(platform);

  if (key === "facebook") {
    return <FaFacebook className="h-[18px] w-[18px] text-[#1877f2]" />;
  }

  if (key === "instagram") {
    return <FaInstagram className="h-[18px] w-[18px] text-[#e4405f]" />;
  }

  if (key === "youtube") {
    return <FaYoutube className="h-[18px] w-[18px] text-[#ff0000]" />;
  }

  if (key === "tiktok") {
    return <FaTiktok className="h-[18px] w-[18px] text-gray-950" />;
  }

  if (key === "linkedin") {
    return <FaLinkedin className="h-[18px] w-[18px] text-[#0a66c2]" />;
  }

  return <Globe className="h-[18px] w-[18px]" />;
}

function EditableCompanyPreview({
  draft,
  companyQueue,
  socialPlatformOptions,
  onDraftChange,
  onImageSelect,
  onOpenImageGallery,
}: {
  draft: ProfileDraft;
  companyQueue: HousingQueueDTO | null;
  socialPlatformOptions: string[];
  onDraftChange: <K extends keyof ProfileDraft>(
    key: K,
    value: ProfileDraft[K]
  ) => void;
  onImageSelect: (field: "logoUrl" | "bannerUrl", file: File) => void;
  onOpenImageGallery: () => void;
}) {
  const { locale } = useI18n();
  const updateAdditionalSocialLink = (
    index: number,
    patch: Partial<SocialLinkDraft>
  ) => {
    onDraftChange(
      "additionalSocialLinks",
      draft.additionalSocialLinks.map((link, linkIndex) =>
        linkIndex === index ? { ...link, ...patch } : link
      )
    );
  };

  const addAdditionalSocialLink = () => {
    onDraftChange("additionalSocialLinks", [
      ...draft.additionalSocialLinks,
      { platform: "", url: "" },
    ]);
  };

  const removeAdditionalSocialLink = (index: number) => {
    onDraftChange(
      "additionalSocialLinks",
      draft.additionalSocialLinks.filter((_, linkIndex) => linkIndex !== index)
    );
  };

  const visibleSocialLinks = draft.additionalSocialLinks.filter(
    (link) => draftString(link.platform) && draftString(link.url)
  );
  const cityLabel =
    uniqueCityLabels(draft.cities).join(", ") ||
    formatCityName(companyQueue?.city?.replace(/_/g, " ") ?? "");

  return (
    <section
      aria-label={localizedText(locale, "Förhandsvisning av företagsprofil", "Company profile preview")}
      className="mx-auto flex w-full max-w-6xl flex-col gap-8"
    >
      <div className="relative">
        <div
          className="relative w-full overflow-hidden rounded-2xl bg-gray-100"
          style={{ aspectRatio: COMPANY_BANNER_ASPECT_RATIO }}
        >
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
          {localizedText(locale, "Omslagsbild", "Cover image")}
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
              aria-label={localizedText(locale, "Redigera logga", "Edit logo")}
              title={localizedText(locale, "Redigera logga", "Edit logo")}
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
              {draft.name || localizedText(locale, "Företagsprofil", "Company profile")}
            </h2>

            <input
              aria-label={localizedText(locale, "Underrubrik", "Subtitle")}
              value={draft.subtitle}
              onChange={(event) => onDraftChange("subtitle", event.target.value)}
              className={`${inlineInputClass} mt-2 w-full max-w-2xl text-sm font-medium text-gray-600 sm:text-base`}
              placeholder={localizedText(locale, "Kort underrubrik för företaget", "Short company subtitle")}
            />

            {cityLabel && (
              <div className="mt-3 flex items-center gap-1.5 text-sm text-gray-600">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                <span>{cityLabel}</span>
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {visibleSocialLinks.slice(0, 4).map((link, index) => (
              <span
                key={`${draftString(link.platform)}-${index}`}
                title={draftString(link.platform)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-400"
              >
                <SocialPlatformIcon platform={draftString(link.platform)} />
              </span>
            ))}
            {visibleSocialLinks.length > 0 ? (
              <div className="mx-0.5 h-5 w-px bg-gray-200" />
            ) : null}
            <button
              type="button"
              disabled
              aria-label={localizedText(locale, "Dela", "Share")}
              title={localizedText(locale, "Dela", "Share")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-300"
            >
              <Share2 className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-2">
          <InlineLabel>{localizedText(locale, "Sociala länkar", "Social links")}</InlineLabel>
          <div className="grid gap-3">
            {draft.additionalSocialLinks.map((link, index) => {
              const platformOptions = getSocialPlatformOptionsForLink(
                socialPlatformOptions,
                draftString(link.platform),
                draft.additionalSocialLinks
              );

              return (
                <div
                  key={index}
                  className="grid gap-2 rounded-xl border border-gray-100 bg-gray-50/70 p-3 sm:grid-cols-[auto_minmax(0,180px)_minmax(0,1fr)_auto]"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm"
                    title={draftString(link.platform) || localizedText(locale, "Social plattform", "Social platform")}
                  >
                    <SocialPlatformIcon platform={draftString(link.platform)} />
                  </span>
                  {platformOptions.length > 0 ? (
                    <select
                      aria-label={localizedText(locale, "Social plattform", "Social platform")}
                      value={draftString(link.platform)}
                      onChange={(event) =>
                        updateAdditionalSocialLink(index, {
                          platform: event.target.value,
                        })
                      }
                      className={iconInputClass}
                    >
                      <option value="">{localizedText(locale, "Välj plattform", "Choose platform")}</option>
                      {platformOptions.map((platform) => (
                        <option key={platformKey(platform)} value={platform}>
                          {platform}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      aria-label={localizedText(locale, "Social plattform", "Social platform")}
                      value={draftString(link.platform)}
                      onChange={(event) =>
                        updateAdditionalSocialLink(index, {
                          platform: event.target.value,
                        })
                      }
                      className={iconInputClass}
                      placeholder={localizedText(locale, "plattform", "platform")}
                    />
                  )}
                  <input
                    aria-label={localizedText(locale, "Social länk", "Social link")}
                    type="url"
                    value={draftString(link.url)}
                    onChange={(event) =>
                      updateAdditionalSocialLink(index, {
                        url: event.target.value,
                      })
                    }
                    className={iconInputClass}
                    placeholder="https://"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={localizedText(locale, "Ta bort social länk", "Remove social link")}
                    title={localizedText(locale, "Ta bort social länk", "Remove social link")}
                    onClick={() => removeAdditionalSocialLink(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}

            <Button
              type="button"
              variant="outline"
              className="w-fit"
              onClick={addAdditionalSocialLink}
            >
              <Plus className="h-4 w-4" />
              {localizedText(locale, "Lägg till social länk", "Add social link")}
            </Button>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">{localizedText(locale, "Om oss", "About us")}</h2>
          <textarea
            aria-label={localizedText(locale, "Om oss", "About us")}
            value={draft.description}
            onChange={(event) => onDraftChange("description", event.target.value)}
            className={`${inlineInputClass} min-h-40 w-full resize-y text-base leading-relaxed text-gray-600`}
            placeholder={localizedText(locale, "Beskriv företaget", "Describe the company")}
          />
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">{localizedText(locale, "Kontakt", "Contact")}</h2>
          <div className="grid gap-3 lg:grid-cols-2">
            <EditableContactRow
              icon={<Phone className="h-4 w-4 shrink-0 text-gray-400" />}
              label={localizedText(locale, "Kontakt telefon", "Contact phone")}
              value={draft.contactPhone}
              onChange={(value) => onDraftChange("contactPhone", value)}
              placeholder="070-000 00 00"
            />
            <EditableContactRow
              icon={<Mail className="h-4 w-4 shrink-0 text-gray-400" />}
              label={localizedText(locale, "Kontakt e-post", "Contact email")}
              type="email"
              value={draft.contactEmail}
              onChange={(value) => onDraftChange("contactEmail", value)}
              placeholder="kontakt@foretag.se"
            />
            <EditableContactRow
              icon={<Globe className="h-4 w-4 shrink-0 text-gray-400" />}
              label={localizedText(locale, "Hemsida", "Website")}
              type="url"
              value={draft.websiteUrl}
              onChange={(value) => onDraftChange("websiteUrl", value)}
              placeholder="https://"
            />
            <EditableContactRow
              icon={<Link2 className="h-4 w-4 shrink-0 text-gray-400" />}
              label={localizedText(locale, "Integritetspolicy", "Privacy policy")}
              type="url"
              value={draft.privacyPolicyUrl}
              onChange={(value) => onDraftChange("privacyPolicyUrl", value)}
              placeholder="https://"
            />
            <EditableContactRow
              icon={<Link2 className="h-4 w-4 shrink-0 text-gray-400" />}
              label={localizedText(locale, "Villkor", "Terms")}
              type="url"
              value={draft.termsUrl}
              onChange={(value) => onDraftChange("termsUrl", value)}
              placeholder="https://"
            />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">{localizedText(locale, "Media", "Media")}</h2>
          <div className="grid gap-3 lg:grid-cols-2">
            <ImageGalleryField
              imageUrls={draft.pictureUrlList}
              onOpen={onOpenImageGallery}
            />
            <UrlListEditor
              icon={<Video className="h-4 w-4 text-gray-400" />}
              label={localizedText(locale, "Video-URL:er", "Video URLs")}
              values={draft.videoUrlList}
              placeholder="https://www.youtube.com/watch?v=..."
              addLabel={localizedText(locale, "Lägg till", "Add")}
              emptyLabel={localizedText(locale, "Inga YouTube-videor tillagda.", "No YouTube videos added.")}
              getIsInvalidValue={(value) => !isYouTubeVideoUrl(value)}
              invalidText={localizedText(
                locale,
                "Endast YouTube-länkar accepteras.",
                "Only YouTube links are accepted."
              )}
              onChange={(videoUrlList) => onDraftChange("videoUrlList", videoUrlList)}
            />
          </div>
        </div>
      </section>
    </section>
  );
}

export default function ProfilePage() {
  const { locale } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const previewImageUrlsRef = useRef<{
    logoUrl: string | null;
    bannerUrl: string | null;
  }>({
    logoUrl: null,
    bannerUrl: null,
  });
  const selectedImageFilesRef = useRef<{
    logoUrl: File | null;
    bannerUrl: File | null;
  }>({
    logoUrl: null,
    bannerUrl: null,
  });

  // The editor keeps an in-page mirror of `company`+`companyQueue`+`draft`
  // so the user can type freely without hitting React Query's cache. Server
  // data flows in via the hooks; we hydrate the editor on first load (and on
  // companyId change). Saves invalidate the cache, which triggers re-hydration.
  const [company, setCompany] = useState<CompanyPrivateDTO | null>(null);
  const [companyQueue, setCompanyQueue] = useState<HousingQueueDTO | null>(null);
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [hydratedCompanyId, setHydratedCompanyId] = useState<number | null>(null);
  const [bannerFileToCrop, setBannerFileToCrop] = useState<File | null>(null);
  const [uploadGalleryVisible, setUploadGalleryVisible] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const companyId = getActiveCompanyId(user);
  const updateCompanyData = useUpdateCompanyData();
  const uploadLogo = useUploadCompanyLogo();
  const uploadBanner = useUploadCompanyBanner();
  const uploadCompanyPublicMedia = useUploadCompanyPublicMedia();

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

  const isInvalidCompanyId =
    !authLoading && user != null && (companyId == null || Number.isNaN(companyId));

  // Four parallel reads. Each cached under its own key — opening another
  // company portal page reuses these without a network call.
  const {
    data: companyData,
    isLoading: companyLoading,
    isError: isCompanyError,
    error: companyErr,
  } = useCompanyPrivate(companyId);
  const { data: companyQueues } = useQueuesByCompany(companyId);
  const { data: publicCompanyData } = useCompanyPublic(companyId);
  const { data: socialPlatforms = [] } = usePlatforms();

  const companyDataWithPublicFields = useMemo(
    () =>
      companyData
        ? withPublicProfileFields(companyData, publicCompanyData ?? null)
        : null,
    [companyData, publicCompanyData],
  );
  const socialPlatformOptions = useMemo(
    () => normalizeSocialPlatformOptions(socialPlatforms),
    [socialPlatforms],
  );

  // Hydrate the editor state from cached server data. Reruns when companyId
  // changes (new portal context) or after a save invalidates and refetches.
  useEffect(() => {
    if (companyId == null || !companyDataWithPublicFields) return;
    if (hydratedCompanyId === companyId && company && draft) return;

    const firstQueue =
      Array.isArray(companyQueues) && companyQueues.length > 0
        ? companyQueues[0]
        : null;

    setCompany(companyDataWithPublicFields);
    setCompanyQueue(firstQueue);
    setDraft(
      buildInitialDraft(
        companyId,
        companyDataWithPublicFields,
        firstQueue ?? undefined,
      ),
    );
    setHydratedCompanyId(companyId);
  }, [
    companyId,
    companyDataWithPublicFields,
    companyQueues,
    company,
    draft,
    hydratedCompanyId,
  ]);

  useEffect(() => {
    if (isInvalidCompanyId) {
      setError(localizedText(locale, "Ogiltigt företags-ID.", "Invalid company ID."));
    } else if (isCompanyError) {
      setError(
        companyErr instanceof Error
          ? companyErr.message
          : localizedText(locale, "Kunde inte ladda företagsprofilen.", "Could not load the company profile.")
      );
    } else {
      setError(null);
    }
  }, [isInvalidCompanyId, isCompanyError, companyErr, locale]);

  const loading = (authLoading || companyLoading) && !company;

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

  const applySelectedImageFile = (field: "logoUrl" | "bannerUrl", file: File) => {
    const previousPreview = previewImageUrlsRef.current[field];
    if (previousPreview) {
      URL.revokeObjectURL(previousPreview);
    }

    const localPreviewUrl = URL.createObjectURL(file);
    previewImageUrlsRef.current[field] = localPreviewUrl;
    selectedImageFilesRef.current[field] = file;
    updateDraftField(field, localPreviewUrl);
  };

  const handleImageSelect = (field: "logoUrl" | "bannerUrl", file: File) => {
    if (field === "bannerUrl") {
      setBannerFileToCrop(file);
      return;
    }

    applySelectedImageFile(field, file);
  };

  const handleBannerCropCancel = () => {
    setBannerFileToCrop(null);
  };

  const handleBannerCropComplete = (file: File) => {
    setBannerFileToCrop(null);
    applySelectedImageFile("bannerUrl", file);
  };

  const uploadGalleryImages = async (files: File[]) => {
    if (!draft) {
      throw new Error(localizedText(locale, "Kunde inte hitta fÃ¶retagsprofilen.", "Could not find the company profile."));
    }

    return Promise.all(
      files.map((file) =>
        uploadCompanyPublicMedia.mutateAsync({
          companyId: draft.companyId,
          file,
        })
      )
    );
  };

  const persistGalleryImages = async (imageUrls: string[]) => {
    if (!draft) return;

    const pictureUrlList = normalizeUrlList(imageUrls);

    await updateCompanyData.mutateAsync({
      id: draft.companyId,
      payload: { pictureUrlList },
    });

    setDraft((current) =>
      current ? { ...current, pictureUrlList } : current
    );
    setCompany((current) =>
      current ? { ...current, pictureUrlList } : current
    );
    setSaveMessage(localizedText(locale, "Bildgalleriet har sparats.", "The image gallery has been saved."));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft || saving) return;

    const invalidVideoUrls = getInvalidYouTubeVideoUrls(draft.videoUrlList);
    if (invalidVideoUrls.length > 0) {
      setSaveMessage(null);
      setError(
        localizedText(
          locale,
          "Video-URL:er måste vara YouTube-länkar.",
          "Video URLs must be YouTube links."
        )
      );
      return;
    }

    setSaving(true);
    setError(null);
    setSaveMessage(null);

    try {
      const selectedImages = selectedImageFilesRef.current;
      const hasSelectedLogo = Boolean(selectedImages.logoUrl);
      const hasSelectedBanner = Boolean(selectedImages.bannerUrl);
      const hasSelectedImages = hasSelectedLogo || hasSelectedBanner;
      const savedDraft = company
        ? buildInitialDraft(draft.companyId, company, companyQueue ?? undefined)
        : null;
      // Each mutation invalidates the related caches on settle. We still
      // run them in parallel because they target different endpoints.
      const [uploadedLogoUrl, uploadedBannerUrl] = await Promise.all([
        selectedImages.logoUrl
          ? uploadLogo.mutateAsync({
              id: draft.companyId,
              target: "logo",
              file: selectedImages.logoUrl,
            })
          : Promise.resolve<string | null>(null),
        selectedImages.bannerUrl
          ? uploadBanner.mutateAsync({
              id: draft.companyId,
              target: "banner",
              file: selectedImages.bannerUrl,
            })
          : Promise.resolve<string | null>(null),
      ]);
      const uploadResolvedDraft: ProfileDraft = {
        ...draft,
        logoUrl:
          uploadedLogoUrl ??
          (hasSelectedLogo ? company?.logoUrl ?? "" : draft.logoUrl),
        bannerUrl:
          uploadedBannerUrl ??
          (hasSelectedBanner ? company?.bannerUrl ?? "" : draft.bannerUrl),
      };
      const hasCompanyDataChanges =
        getCompanyDataSnapshot(uploadResolvedDraft) !==
        getCompanyDataSnapshot(savedDraft);

      if (hasCompanyDataChanges) {
        await updateCompanyData.mutateAsync({
          id: uploadResolvedDraft.companyId,
          payload: buildCompanyChangePayload(uploadResolvedDraft),
        });
      }

      const previewImageUrls = previewImageUrlsRef.current;
      if (hasSelectedLogo && previewImageUrls.logoUrl) {
        URL.revokeObjectURL(previewImageUrls.logoUrl);
        previewImageUrls.logoUrl = null;
      }
      if (hasSelectedBanner && previewImageUrls.bannerUrl) {
        URL.revokeObjectURL(previewImageUrls.bannerUrl);
        previewImageUrls.bannerUrl = null;
      }
      selectedImageFilesRef.current = { logoUrl: null, bannerUrl: null };

      const savedCompany = hasSelectedImages
        ? await companyService
            .privateProfile(uploadResolvedDraft.companyId)
            .then((freshCompany) => mergeSavedCompany(freshCompany, {
              ...uploadResolvedDraft,
              logoUrl: freshCompany.logoUrl ?? uploadResolvedDraft.logoUrl,
              bannerUrl: freshCompany.bannerUrl ?? uploadResolvedDraft.bannerUrl,
            }))
            .catch(() => mergeSavedCompany(company, uploadResolvedDraft))
        : mergeSavedCompany(company, uploadResolvedDraft);
      const savedQueue = companyQueue
        ? {
            ...companyQueue,
            logoUrl: savedCompany.logoUrl ?? companyQueue.logoUrl,
            bannerUrl: savedCompany.bannerUrl ?? companyQueue.bannerUrl,
            socialLinks: socialLinksToRecord(uploadResolvedDraft),
          }
        : companyQueue;

      setCompany(savedCompany);
      setCompanyQueue(savedQueue);
      setDraft(
        buildInitialDraft(
          uploadResolvedDraft.companyId,
          savedCompany,
          savedQueue ?? undefined
        )
      );
      setSaveMessage(localizedText(locale, "Företagsprofilen har sparats.", "The company profile has been saved."));
      // Note: invalidation is already handled by the mutation hooks above
      // (uploadLogo / uploadBanner / updateCompanyData each drop the
      // private + public + queue caches on settle). No manual invalidate
      // needed here.
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : localizedText(locale, "Kunde inte spara företagsprofilen.", "Could not save the company profile.")
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
    selectedImageFilesRef.current = { logoUrl: null, bannerUrl: null };
    setDraft(buildInitialDraft(draft.companyId, company, companyQueue ?? undefined));
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        {localizedText(locale, "Laddar profil...", "Loading profile...")}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        {localizedText(locale, "Logga in för att hantera företagsprofilen.", "Log in to manage the company profile.")}
      </div>
    );
  }

  if (companyId == null || Number.isNaN(companyId)) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        {localizedText(locale, "Denna profilsida gäller bara för företagskonton.", "This profile page is only for company accounts.")}
      </div>
    );
  }

  if (loading || !draft) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        {localizedText(locale, "Hämtar företagsprofil...", "Loading company profile...")}
      </div>
    );
  }

  return (
    <main className="pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {localizedText(locale, "Redigera profil", "Edit profile")}
        </h1>
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
          socialPlatformOptions={socialPlatformOptions}
          onDraftChange={updateDraftField}
          onImageSelect={handleImageSelect}
          onOpenImageGallery={() => setUploadGalleryVisible(true)}
        />

        <div className="sticky bottom-4 z-10 mx-auto flex w-full max-w-6xl flex-col gap-3 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            {hasUnsavedChanges ? (
              <span className="inline-flex w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                {localizedText(locale, "Osparade ändringar", "Unsaved changes")}
              </span>
            ) : (
              <span className="text-sm text-gray-500">{localizedText(locale, "Inga ändringar.", "No changes.")}</span>
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
                {localizedText(locale, "Återställ", "Reset")}
              </Button>
            )}
            <Button
              type="submit"
              isDisabled={!hasUnsavedChanges || saving}
              isLoading={saving}
              title={
                hasUnsavedChanges
                  ? localizedText(locale, "Spara företagsprofilen", "Save company profile")
                  : localizedText(locale, "Det finns inga ändringar att spara.", "There are no changes to save.")
              }
            >
              {!saving && <Save className="h-4 w-4" />}
              {saving
                ? localizedText(locale, "Sparar...", "Saving...")
                : localizedText(locale, "Spara ändringar", "Save changes")}
            </Button>
          </div>
        </div>
      </form>

      <BannerImageCropDialog
        file={bannerFileToCrop}
        open={Boolean(bannerFileToCrop)}
        onOpenChange={(open) => {
          if (!open) handleBannerCropCancel();
        }}
        onCancel={handleBannerCropCancel}
        onCropComplete={handleBannerCropComplete}
      />

      <ImageUploadGallery
        open={uploadGalleryVisible}
        setOpen={setUploadGalleryVisible}
        imageUrls={normalizeUrlList(draft.pictureUrlList)}
        onUploadImages={uploadGalleryImages}
        onSave={persistGalleryImages}
        locale={locale}
        uploadSuccessMessage={localizedText(
          locale,
          "Bilden har laddats upp och sparats i bildgalleriet.",
          "The image has been uploaded and saved to the image gallery."
        )}
        replaceSuccessMessage={localizedText(
          locale,
          "Bilden har bytts och sparats i bildgalleriet.",
          "The image has been replaced and saved to the image gallery."
        )}
        saveSuccessMessage={localizedText(
          locale,
          "Bildgalleriet har sparats.",
          "The image gallery has been saved."
        )}
      />
    </main>
  );
}
