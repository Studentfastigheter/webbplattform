"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type DragEvent,
} from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import CompanyLogo from "@/components/shared/CompanyLogo";
import { RichTextTextarea } from "@/components/ui/RichTextTextarea";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";
import { getActiveCompanyId } from "@/lib/company-access";
import {
  companyService,
  type CompanyChangeableDataDTO,
  type CompanyPrivateDTO,
  type SocialPlatform,
} from "@/features/companies/services/company-service";
import {
  useCompanyPrivate,
  usePlatforms,
  useUpdateCompanyData,
  useUploadCompanyBanner,
  useUploadCompanyLogo,
} from "@/features/companies/hooks/useCompanies";
import { useQueuesByCompany } from "@/features/queues/hooks/useQueues";
import { type HousingQueueDTO } from "@/types/queue";
import { formatCityName } from "@/features/cities/city-utils";
import CompanyVideoSection, {
  type CompanyVideo,
} from "@/features/ads/components/CompanyVideoSection";
import {
  Globe,
  ImageIcon,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Save,
  Share2,
  Trash2,
  Video,
} from "@/components/icons";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTiktok,
  FaYoutube,
} from "@/components/icons";
import { UploadButton } from "../_components/shared/UploadButton";
import BannerImageCropDialog from "@/components/shared/BannerImageCropDialog";
import { COMPANY_BANNER_ASPECT_RATIO } from "@/lib/banner-image";
import {
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
  getYouTubeVideoId,
  isYouTubeVideoUrl,
} from "@/lib/youtube-url";
import { useUploadCompanyPublicMedia } from "@/features/media/hooks/useMedia";
import { PortalPage, PortalSurface } from "../_components/shared/PortalGrid";
import PortalPageHeader from "../_components/shared/PortalPageHeader";

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

const imageEditButtonClass =
  "!border-white/80 !bg-white/95 !text-[#004225] shadow-[0_10px_24px_rgba(15,23,42,0.16)] ring-1 ring-white/70 backdrop-blur-md transition-[background-color,border-color,box-shadow,color,transform] duration-150 hover:!border-[#004225]/25 hover:!bg-white hover:!text-[#00351e] hover:shadow-[0_12px_28px_rgba(0,66,37,0.18)] data-[hover=true]:!border-[#004225]/25 data-[hover=true]:!bg-white data-[hover=true]:!text-[#00351e] data-[hover=true]:!opacity-100 data-[pressed=true]:!bg-[#f2f8f5]";

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

function toCompanyVideo(url: string): CompanyVideo | null {
  const youtubeId = getYouTubeVideoId(url);
  if (!youtubeId) return null;

  return {
    originalUrl: url,
    embedUrl: getYouTubeEmbedUrl(youtubeId),
    thumbnailUrl: getYouTubeThumbnailUrl(youtubeId),
  };
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
    websiteUrl: companyData.website ?? "",
    privacyPolicyUrl: companyData.privacyPolicyUrl ?? "",
    termsUrl: companyData.termsUrl ?? "",
    contactEmail: companyData.contactEmail ?? "",
    contactPhone: companyData.contactPhone ?? "",
    cities: companyData.cities ?? [],
    logoUrl: companyData.logoUrl ?? "",
    bannerUrl: companyData.bannerUrl ?? "",
    additionalSocialLinks: buildAdditionalSocialLinks(
      companyData.socialLinks ?? firstQueue?.socialLinks
    ),
    pictureUrlList: normalizeUrlList(companyData.pictureUrlList),
    videoUrlList: normalizeUrlList(companyData.videoUrlList),
    orgNumber: companyData.orgNumber ?? "",
    internalContactNote: companyData.contactNote ?? "",
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
    website: draft.websiteUrl,
    privacyPolicyUrl: draft.privacyPolicyUrl,
    termsUrl: draft.termsUrl,
    contactEmail: draft.contactEmail,
    contactPhone: draft.contactPhone,
    contactNote: company?.contactNote ?? "",
    orgNumber: company?.orgNumber ?? draft.orgNumber,
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

function ContactFormField({
  id,
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field className="gap-2">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-14 rounded-[8px] border-transparent bg-[#f2f2f2] px-4 text-base shadow-none placeholder:text-[#7a7a7a] focus-visible:border-[#004225] focus-visible:ring-[#004225]/20"
        placeholder={placeholder}
      />
    </Field>
  );
}

function ContactFormSection({
  draft,
  onDraftChange,
}: {
  draft: ProfileDraft;
  onDraftChange: <K extends keyof ProfileDraft>(
    key: K,
    value: ProfileDraft[K]
  ) => void;
}) {
  const { locale } = useI18n();

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="w-full rounded-[24px] bg-white px-5 py-6 shadow-[0_18px_55px_rgba(15,23,42,0.12)] sm:px-6">
        <div className="mb-6 flex flex-col items-start gap-2 text-left">
          <h2 className="text-2xl font-bold text-[#1f1f1f]">
            {localizedText(locale, "Kontakt", "Contact")}
          </h2>
        </div>

        <FieldGroup className="grid gap-x-5 gap-y-6 md:grid-cols-2 [&>[data-slot=field]]:min-w-0">
          <ContactFormField
            id="company-contact-phone"
            label={localizedText(locale, "Telefonnummer", "Phone number")}
            value={draft.contactPhone}
            onChange={(value) => onDraftChange("contactPhone", value)}
            placeholder="070-000 00 00"
          />
          <ContactFormField
            id="company-contact-email"
            label={localizedText(locale, "E-postadress", "Email address")}
            type="email"
            value={draft.contactEmail}
            onChange={(value) => onDraftChange("contactEmail", value)}
            placeholder="kontakt@foretag.se"
          />
          <ContactFormField
            id="company-website"
            label={localizedText(locale, "Hemsida", "Website")}
            type="url"
            value={draft.websiteUrl}
            onChange={(value) => onDraftChange("websiteUrl", value)}
            placeholder="https://www.foretag.se"
          />
          <div className="grid gap-x-5 gap-y-6 md:col-span-2 md:grid-cols-2">
            <ContactFormField
              id="company-privacy-policy"
              label={localizedText(locale, "Integritetspolicy", "Privacy policy")}
              type="url"
              value={draft.privacyPolicyUrl}
              onChange={(value) => onDraftChange("privacyPolicyUrl", value)}
              placeholder="https://www.foretag.se/integritet"
            />
            <ContactFormField
              id="company-terms"
              label={localizedText(locale, "Villkorspolicy", "Terms policy")}
              type="url"
              value={draft.termsUrl}
              onChange={(value) => onDraftChange("termsUrl", value)}
              placeholder="https://www.foretag.se/villkor"
            />
          </div>
        </FieldGroup>
      </div>
    </section>
  );
}

function EditableImageGallerySection({
  imageUrls,
  companyName,
  onUploadImages,
  onSaveImages,
}: {
  imageUrls?: string[];
  companyName: string;
  onUploadImages: (files: File[]) => Promise<string[]>;
  onSaveImages: (imageUrls: string[]) => Promise<void>;
}) {
  const { locale } = useI18n();
  const visibleImages = normalizeUrlList(imageUrls);
  const [pendingGalleryAction, setPendingGalleryAction] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const uploadInputId = "company-profile-gallery-upload";

  const uploadFiles = async (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0 || pendingGalleryAction) return;

    setPendingGalleryAction(true);
    try {
      const uploadedUrls = await onUploadImages(imageFiles);
      if (uploadedUrls.length === 0) return;

      const nextImages = [...visibleImages, ...uploadedUrls];
      await onSaveImages(nextImages);
      toast.success(
        localizedText(
          locale,
          uploadedUrls.length === 1
            ? "Bilden har laddats upp."
            : "Bilderna har laddats upp.",
          uploadedUrls.length === 1
            ? "The image has been uploaded."
            : "The images have been uploaded."
        )
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : localizedText(locale, "Kunde inte ladda upp bilden.", "Could not upload the image.")
      );
    } finally {
      setPendingGalleryAction(false);
      setIsDragActive(false);
    }
  };

  const removeImage = async (index: number) => {
    if (pendingGalleryAction) return;
    setPendingGalleryAction(true);

    try {
      const nextImages = visibleImages.filter(
        (_, imageIndex) => imageIndex !== index
      );
      await onSaveImages(nextImages);
      toast.success(localizedText(locale, "Bilden har tagits bort.", "The image has been removed."));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : localizedText(locale, "Kunde inte ta bort bilden.", "Could not remove the image.")
      );
    } finally {
      setPendingGalleryAction(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    void uploadFiles(Array.from(event.dataTransfer.files));
  };

  return (
    <section
      className="mx-auto w-full max-w-6xl"
      aria-label={localizedText(locale, "Bildgalleri", "Image gallery")}
    >
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">
              {localizedText(locale, "Bildgalleri", "Image gallery")}
            </h2>
            <span className="rounded-full bg-[#004225]/[0.08] px-2.5 py-1 text-xs font-semibold text-[#004225]">
              {visibleImages.length}{" "}
              {localizedText(
                locale,
                visibleImages.length === 1 ? "bild" : "bilder",
                visibleImages.length === 1 ? "image" : "images"
              )}
            </span>
          </div>
        </div>
      </div>

      <input
        id={uploadInputId}
        type="file"
        accept="image/*"
        multiple
        disabled={pendingGalleryAction}
        className="sr-only"
        onChange={(event) => {
          void uploadFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />
      <label
        htmlFor={uploadInputId}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragActive(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
          setIsDragActive(true);
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={handleDrop}
        className={`flex min-h-[180px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-4 py-8 text-center text-sm font-medium transition ${
          isDragActive
            ? "border-[#004225] bg-[#004225]/[0.04] text-[#004225]"
            : "border-gray-300 bg-gray-50 text-gray-500 hover:border-[#004225]/40 hover:bg-[#004225]/[0.03]"
        } ${pendingGalleryAction ? "pointer-events-none opacity-60" : ""}`}
      >
        <ImageIcon className="h-8 w-8 text-[#004225]" />
        <span>{localizedText(locale, "Släpp bilder här", "Drop images here")}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#004225] px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
          <Plus className="h-3.5 w-3.5" />
          {localizedText(locale, "Välj bilder", "Choose images")}
        </span>
      </label>

      {visibleImages.length > 0 ? (
        <div className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {visibleImages.map((image, index) => (
            <figure
              key={`${image}-${index}`}
              className="relative mb-4 block w-full break-inside-avoid align-top"
            >
              <img
                src={image}
                alt={localizedText(
                  locale,
                  `${companyName} - bild ${index + 1}`,
                  `${companyName} - image ${index + 1}`
                )}
                className="block h-auto w-full rounded-xl"
              />
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label={localizedText(locale, "Ta bort bild", "Remove image")}
                title={localizedText(locale, "Ta bort bild", "Remove image")}
                onClick={() => void removeImage(index)}
                isDisabled={pendingGalleryAction}
                className="absolute right-2 top-2 min-w-0 border-red-200 bg-white/95 text-red-600 shadow-sm hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </figure>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function EditableVideoSection({
  videoUrls,
  companyName,
  onChange,
}: {
  videoUrls?: string[];
  companyName: string;
  onChange: (values: string[]) => void;
}) {
  const { locale } = useI18n();
  const listValues = videoUrls && videoUrls.length > 0 ? videoUrls : [""];
  const videos = useMemo<CompanyVideo[]>(() => {
    return normalizeUrlList(videoUrls)
      .map(toCompanyVideo)
      .filter((video): video is CompanyVideo => video !== null);
  }, [videoUrls]);
  const canAddVideo = listValues.every((value) => value.trim());

  const updateValue = (index: number, value: string) => {
    onChange(
      listValues.map((entry, entryIndex) =>
        entryIndex === index ? value : entry
      )
    );
  };

  const addValue = () => {
    if (!canAddVideo) return;
    onChange([...listValues, ""]);
  };

  const removeValue = (index: number) => {
    const nextValues = listValues.filter(
      (_, entryIndex) => entryIndex !== index
    );
    onChange(nextValues.length > 0 ? nextValues : []);
  };

  return (
    <section
      className="mx-auto w-full max-w-6xl"
      aria-label={localizedText(locale, "Videor", "Videos")}
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {localizedText(locale, "Videor", "Videos")}
        </h2>
      </div>

      {videos.length > 0 ? (
        <CompanyVideoSection
          videos={videos}
          companyName={companyName}
        />
      ) : (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 text-center text-sm text-gray-500">
          <Video className="h-7 w-7 text-gray-400" />
          <span>
            {localizedText(
              locale,
              "Inga videor tillagda.",
              "No videos added.",
            )}
          </span>
        </div>
      )}

      <div className="mt-4 grid gap-2">
        {listValues.map((value, index) => {
          const isInvalid = Boolean(
            value.trim() && !isYouTubeVideoUrl(value)
          );
          const canRemove = listValues.length > 1 || value.trim();

          return (
            <div
              key={index}
              className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
            >
              <div className="grid gap-1">
                <input
                  aria-invalid={isInvalid || undefined}
                  aria-label={localizedText(
                    locale,
                    `YouTube-länk ${index + 1}`,
                    `YouTube link ${index + 1}`,
                  )}
                  type="url"
                  value={value}
                  onChange={(event) => updateValue(index, event.target.value)}
                  className={`${iconInputClass} ${
                    isInvalid
                      ? "border-red-300 text-red-700 focus:border-red-500 focus:ring-red-100"
                      : ""
                  }`}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                {isInvalid && (
                  <p className="text-xs font-medium text-red-600">
                    {localizedText(
                      locale,
                      "Endast YouTube-länkar accepteras.",
                      "Only YouTube links are accepted.",
                    )}
                  </p>
                )}
              </div>
              {canRemove ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={localizedText(
                    locale,
                    "Ta bort video",
                    "Remove video",
                  )}
                  title={localizedText(locale, "Ta bort video", "Remove video")}
                  onClick={() => removeValue(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addValue}
          isDisabled={!canAddVideo}
        >
          <Plus className="h-4 w-4" />
          {localizedText(locale, "Lägg till video", "Add video")}
        </Button>
      </div>
    </section>
  );
}

function SocialPlatformIcon({ platform }: { platform: string }) {
  const key = platformIconKey(platform);
  const iconClassName = "h-[18px] w-[18px] text-gray-600";

  if (key === "facebook") {
    return <FaFacebook className={iconClassName} />;
  }

  if (key === "instagram") {
    return <FaInstagram className={iconClassName} />;
  }

  if (key === "youtube") {
    return <FaYoutube className={iconClassName} />;
  }

  if (key === "tiktok") {
    return <FaTiktok className={iconClassName} />;
  }

  if (key === "linkedin") {
    return <FaLinkedin className={iconClassName} />;
  }

  return <Globe className={iconClassName} />;
}

function EditableCompanyPreview({
  draft,
  companyQueue,
  socialPlatformOptions,
  onDraftChange,
  onImageSelect,
  onUploadGalleryImages,
  onSaveGalleryImages,
}: {
  draft: ProfileDraft;
  companyQueue: HousingQueueDTO | null;
  socialPlatformOptions: string[];
  onDraftChange: <K extends keyof ProfileDraft>(
    key: K,
    value: ProfileDraft[K]
  ) => void;
  onImageSelect: (field: "logoUrl" | "bannerUrl", file: File) => void;
  onUploadGalleryImages: (files: File[]) => Promise<string[]>;
  onSaveGalleryImages: (imageUrls: string[]) => Promise<void>;
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
          className={`${imageEditButtonClass} absolute right-4 top-4`}
        >
          <Pencil className="h-4 w-4" />
          {localizedText(locale, "Omslagsbild", "Cover image")}
        </UploadButton>
      </div>

      <section className="relative rounded-3xl border border-black/5 bg-white/80 px-4 pb-8 shadow-[0_18px_45px_rgba(0,0,0,0.05)] sm:px-6">
        <div className="relative -mt-14 mb-4 sm:-mt-24">
          <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg sm:h-36 sm:w-36">
            <CompanyLogo
              src={draft.logoUrl}
              alt=""
              name={draft.name}
              className="h-full w-full rounded-xl bg-white ring-0"
              imageClassName="p-2"
              fallbackClassName="text-4xl sm:text-5xl"
            />

            <UploadButton
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label={localizedText(locale, "Redigera logga", "Edit logo")}
              title={localizedText(locale, "Redigera logga", "Edit logo")}
              onFileSelect={(file) => onImageSelect("logoUrl", file)}
              className={`${imageEditButtonClass} absolute right-1 top-1 min-w-0`}
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
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600"
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
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600"
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
          <RichTextTextarea
            aria-label={localizedText(locale, "Om oss", "About us")}
            value={draft.description}
            onValueChange={(value) => onDraftChange("description", value)}
            className={`${inlineInputClass} min-h-40 w-full resize-y text-base leading-relaxed text-gray-600`}
            placeholder={localizedText(locale, "Beskriv företaget", "Describe the company")}
          />
        </div>

      </section>

      <ContactFormSection draft={draft} onDraftChange={onDraftChange} />

      <EditableImageGallerySection
        imageUrls={draft.pictureUrlList}
        companyName={
          draft.name || localizedText(locale, "F\u00f6retagsprofil", "Company profile")
        }
        onUploadImages={onUploadGalleryImages}
        onSaveImages={onSaveGalleryImages}
      />

      <EditableVideoSection
        videoUrls={draft.videoUrlList}
        companyName={
          draft.name || localizedText(locale, "F\u00f6retagsprofil", "Company profile")
        }
        onChange={(videoUrlList) => onDraftChange("videoUrlList", videoUrlList)}
      />
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

  const [saving, setSaving] = useState(false);

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

  // Three parallel reads. Each cached under its own key — opening another
  // company portal page reuses these without a network call.
  const {
    data: companyData,
    isLoading: companyLoading,
    isError: isCompanyError,
    error: companyErr,
  } = useCompanyPrivate(companyId);
  const { data: companyQueues } = useQueuesByCompany(companyId);
  const { data: socialPlatforms = [] } = usePlatforms();

  const socialPlatformOptions = useMemo(
    () => normalizeSocialPlatformOptions(socialPlatforms),
    [socialPlatforms],
  );

  // Hydrate the editor state from cached server data. Reruns when companyId
  // changes (new portal context) or after a save invalidates and refetches.
  useEffect(() => {
    if (companyId == null || !companyData) return;
    if (hydratedCompanyId === companyId && company && draft) return;

    const firstQueue =
      Array.isArray(companyQueues) && companyQueues.length > 0
        ? companyQueues[0]
        : null;

    setCompany(companyData);
    setCompanyQueue(firstQueue);
    setDraft(
      buildInitialDraft(
        companyId,
        companyData,
        firstQueue ?? undefined,
      ),
    );
    setHydratedCompanyId(companyId);
  }, [
    companyId,
    companyData,
    companyQueues,
    company,
    draft,
    hydratedCompanyId,
  ]);

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
      throw new Error(localizedText(locale, "Kunde inte hitta företagsprofilen.", "Could not find the company profile."));
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
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft || saving) return;

    const invalidVideoUrls = getInvalidYouTubeVideoUrls(draft.videoUrlList);
    if (invalidVideoUrls.length > 0) {
      toast.error(
        localizedText(
          locale,
          "Video-URL:er måste vara YouTube-länkar.",
          "Video URLs must be YouTube links."
        )
      );
      return;
    }

    setSaving(true);

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
      toast.success(localizedText(locale, "Företagsprofilen har sparats.", "The company profile has been saved."));
      // Note: invalidation is already handled by the mutation hooks above
      // (uploadLogo / uploadBanner / updateCompanyData each drop the
      // private + public + queue caches on settle). No manual invalidate
      // needed here.
    } catch (saveError) {
      toast.error(
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
      <PortalSurface className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-gray-500" padding="md">
        <Loader2 className="h-4 w-4 animate-spin" />
        {localizedText(locale, "Laddar profil...", "Loading profile...")}
      </PortalSurface>
    );
  }

  if (!user) {
    return (
      <PortalSurface dashed className="text-center text-sm text-gray-500" padding="lg">
        {localizedText(locale, "Logga in för att hantera företagsprofilen.", "Log in to manage the company profile.")}
      </PortalSurface>
    );
  }

  if (companyId == null || Number.isNaN(companyId)) {
    return (
      <PortalSurface dashed className="text-center text-sm text-gray-500" padding="lg">
        {localizedText(locale, "Denna profilsida gäller bara för företagskonton.", "This profile page is only for company accounts.")}
      </PortalSurface>
    );
  }

  if (isCompanyError && !company) {
    return (
      <PortalSurface dashed className="text-center text-sm text-gray-500" padding="lg">
        {companyErr instanceof Error
          ? companyErr.message
          : localizedText(locale, "Kunde inte ladda företagsprofilen.", "Could not load the company profile.")}
      </PortalSurface>
    );
  }

  if (loading || !draft) {
    return (
      <PortalSurface className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-gray-500" padding="md">
        <Loader2 className="h-4 w-4 animate-spin" />
        {localizedText(locale, "Hämtar företagsprofil...", "Loading company profile...")}
      </PortalSurface>
    );
  }

  return (
    <PortalPage className="pb-12">
      <PortalPageHeader
        className="mb-6"
        title={localizedText(locale, "Redigera profil", "Edit profile")}
        description={localizedText(
          locale,
          "Uppdatera f\u00f6retagets publika profil, media och kontaktuppgifter.",
          "Update the company's public profile, media and contact details."
        )}
      />

      <form onSubmit={handleSubmit} className="grid gap-6">
        <EditableCompanyPreview
          draft={draft}
          companyQueue={companyQueue}
          socialPlatformOptions={socialPlatformOptions}
          onDraftChange={updateDraftField}
          onImageSelect={handleImageSelect}
          onUploadGalleryImages={uploadGalleryImages}
          onSaveGalleryImages={persistGalleryImages}
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
    </PortalPage>
  );
}
