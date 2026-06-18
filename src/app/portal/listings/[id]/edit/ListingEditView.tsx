"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Home, MapPin, Pencil } from "@/components/icons";
import { getAppIconElement } from "@/components/icons/catalog";

import BostadImagePreviewGrid from "@/features/ads/components/BostadImagePreviewGrid";
import ImageUploadGallery from "@/features/business-portal/components/ImageUploadGallery";
import { Button } from "@/components/ui/button";
import { RichTextTextarea } from "@/components/ui/RichTextTextarea";
import { useAuth } from "@/context/AuthContext";
import {
  useListing,
  useListingTags,
  useUpdateListing,
} from "@/features/listings/hooks/useListings";
import { useUploadCompanyPublicMedia } from "@/features/media/hooks/useMedia";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/config";
import { localizedText } from "@/i18n/text";
import { getActiveCompanyId } from "@/lib/company-access";
import {
  ListingDetailDTO,
  ListingTagDTO,
  UpdateListingRequest,
} from "@/types/listing";
import PortalPageHeader from "../../../_components/shared/PortalPageHeader";

type ListingEditViewProps = {
  id: string;
};

type SaveStateMessageKey =
  | "noChanges"
  | "tagsStillLoading"
  | "tagsUnavailable"
  | "saved"
  | "saveFailed";

type SaveState = {
  status: "idle" | "saving" | "success" | "error";
  message: string | null;
  messageKey?: SaveStateMessageKey;
};

type EditableListingDraft = Omit<ListingDetailDTO, "tags"> & {
  tags: string[];
};

const emptySaveState: SaveState = {
  status: "idle",
  message: null,
};

const genericTagsLoadError = "__TAGS_LOAD_ERROR__";

const inlineInputClass =
  "min-w-0 rounded-md border border-[#004225]/10 bg-[#004225]/[0.035] px-2 py-1 outline-none transition hover:border-[#004225]/25 hover:bg-white focus:border-[#004225] focus:bg-white focus:ring-4 focus:ring-[#004225]/10";

const imageEditButtonClass =
  "!border-white/80 !bg-white/95 !text-[#004225] shadow-[0_10px_24px_rgba(15,23,42,0.16)] ring-1 ring-white/70 backdrop-blur-md transition-[background-color,border-color,box-shadow,color,transform] duration-150 hover:!border-[#004225]/25 hover:!bg-white hover:!text-[#00351e] hover:shadow-[0_12px_28px_rgba(0,66,37,0.18)] data-[hover=true]:!border-[#004225]/25 data-[hover=true]:!bg-white data-[hover=true]:!text-[#00351e] data-[hover=true]:!opacity-100 data-[pressed=true]:!bg-[#f2f8f5]";

function toDateInputValue(value?: string | null) {
  if (!value) return "";

  const match = value.match(/^\d{4}-\d{2}-\d{2}/);
  return match?.[0] ?? "";
}

function toNullableDateInputValue(value?: string | null) {
  return toDateInputValue(value) || null;
}

function cloneEditableListing(listing: ListingDetailDTO): EditableListingDraft {
  return {
    ...listing,
    availableFrom: toNullableDateInputValue(listing.availableFrom),
    availableTo: toNullableDateInputValue(listing.availableTo),
    applyBy: toNullableDateInputValue(listing.applyBy),
    tags: normalizeTagList(listing.tags),
    imageUrls: [...(listing.imageUrls ?? [])],
    description: listing.description ?? "",
  };
}

function normalizeNumberValue(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeTagValue(value: string | ListingTagDTO) {
  return (typeof value === "string" ? value : value.displayName || value.tagKey || "")
    .normalize("NFC")
    .trim();
}

function normalizeTagIdentifier(value: string | ListingTagDTO) {
  return (typeof value === "string" ? value : value.tagKey || value.displayName || "")
    .normalize("NFC")
    .trim();
}

function normalizeTagKey(value: string | ListingTagDTO) {
  return normalizeTagIdentifier(value).toLocaleLowerCase("sv-SE");
}

function getTagSelectionKeys(value: string | ListingTagDTO) {
  const keys = [normalizeTagIdentifier(value), normalizeTagValue(value)]
    .map((tag) => tag.toLocaleLowerCase("sv-SE"))
    .filter(Boolean);

  return Array.from(new Set(keys));
}

function normalizeTagList(tags: Array<string | ListingTagDTO> | undefined) {
  const seen = new Set<string>();
  const normalizedTags: string[] = [];

  (tags ?? []).forEach((tag) => {
    const normalizedTag = normalizeTagIdentifier(tag);
    const key = normalizeTagKey(normalizedTag);

    if (!normalizedTag || seen.has(key)) {
      return;
    }

    seen.add(key);
    normalizedTags.push(normalizedTag);
  });

  return normalizedTags;
}

function getSelectableTags(tags: ListingTagDTO[]) {
  const seen = new Set<string>();
  const selectableTags: ListingTagDTO[] = [];

  tags.forEach((tag) => {
    const label = normalizeTagValue(tag);
    const identifier = normalizeTagIdentifier(tag);
    const key = normalizeTagKey(identifier);

    if (!label || !identifier || seen.has(key)) {
      return;
    }

    seen.add(key);
    selectableTags.push({ ...tag, displayName: label });
  });

  return selectableTags;
}

function isTagSelected(selectedTags: string[], tag: ListingTagDTO) {
  const selectedKeys = new Set(selectedTags.map(normalizeTagKey));
  return getTagSelectionKeys(tag).some((key) => selectedKeys.has(key));
}

function areStringArraysEqual(left: string[] | undefined, right: string[] | undefined) {
  const normalizedLeft = left ?? [];
  const normalizedRight = right ?? [];

  if (normalizedLeft.length !== normalizedRight.length) {
    return false;
  }

  return normalizedLeft.every((value, index) => value === normalizedRight[index]);
}

function getUploadCompanyId(
  draft: EditableListingDraft,
  activeCompanyId: number | null
) {
  if (activeCompanyId != null && activeCompanyId > 0) {
    return activeCompanyId;
  }

  return Number.isFinite(draft.ownerId) && draft.ownerId > 0
    ? draft.ownerId
    : null;
}

function getEndpointTagsFromSelection(
  selectedTags: Array<string | ListingTagDTO> | undefined,
  availableTags: ListingTagDTO[]
) {
  const selectedKeys = new Set(
    (selectedTags ?? []).flatMap((tag) => getTagSelectionKeys(tag))
  );

  if (availableTags.length === 0) {
    return normalizeTagList(selectedTags);
  }

  const endpointTags: string[] = [];
  const seen = new Set<string>();

  availableTags.forEach((tag) => {
    const endpointTag = normalizeTagIdentifier(tag);
    const endpointKey = normalizeTagKey(endpointTag);

    if (
      endpointTag &&
      !seen.has(endpointKey) &&
      getTagSelectionKeys(tag).some((key) => selectedKeys.has(key))
    ) {
      seen.add(endpointKey);
      endpointTags.push(endpointTag);
    }
  });

  return endpointTags;
}

function getEditableSnapshot(
  listing: EditableListingDraft | ListingDetailDTO | null,
  availableTags: ListingTagDTO[] = []
) {
  if (!listing) return "";

  return JSON.stringify({
    title: listing.title,
    rent: normalizeNumberValue(listing.rent),
    rooms: normalizeNumberValue(listing.rooms),
    sizeM2: normalizeNumberValue(listing.sizeM2),
    availableFrom: toNullableDateInputValue(listing.availableFrom),
    availableTo: toNullableDateInputValue(listing.availableTo),
    applyBy: toNullableDateInputValue(listing.applyBy),
    tags: getEndpointTagsFromSelection(listing.tags, availableTags),
    description: listing.description ?? "",
    imageUrls: listing.imageUrls ?? [],
  });
}

function createUpdatePayload(
  draft: EditableListingDraft,
  listing: EditableListingDraft | null,
  availableTags: ListingTagDTO[]
): UpdateListingRequest {
  const baseline = listing;
  const payload: UpdateListingRequest = {};

  if (!baseline || draft.title !== baseline.title) {
    payload.title = draft.title;
  }

  if (!baseline || normalizeNumberValue(draft.rent) !== normalizeNumberValue(baseline.rent)) {
    payload.rent = normalizeNumberValue(draft.rent);
  }

  if (!baseline || normalizeNumberValue(draft.rooms) !== normalizeNumberValue(baseline.rooms)) {
    payload.rooms = normalizeNumberValue(draft.rooms);
  }

  if (
    !baseline ||
    normalizeNumberValue(draft.sizeM2) !== normalizeNumberValue(baseline.sizeM2)
  ) {
    payload.sizeM2 = normalizeNumberValue(draft.sizeM2);
  }

  if (
    !baseline ||
    toNullableDateInputValue(draft.availableFrom) !==
      toNullableDateInputValue(baseline.availableFrom)
  ) {
    payload.availableFrom = toNullableDateInputValue(draft.availableFrom);
  }

  if (
    !baseline ||
    toNullableDateInputValue(draft.availableTo) !==
      toNullableDateInputValue(baseline.availableTo)
  ) {
    payload.availableTo = toNullableDateInputValue(draft.availableTo);
  }

  if (
    !baseline ||
    toNullableDateInputValue(draft.applyBy) !== toNullableDateInputValue(baseline.applyBy)
  ) {
    payload.applyBy = toNullableDateInputValue(draft.applyBy);
  }

  const draftTags = getEndpointTagsFromSelection(draft.tags, availableTags);
  const baselineTags = getEndpointTagsFromSelection(baseline?.tags, availableTags);
  if (!baseline || !areStringArraysEqual(draftTags, baselineTags)) {
    payload.tags = draftTags;
  }

  if (!baseline || (draft.description ?? "") !== (baseline.description ?? "")) {
    payload.description = draft.description ?? "";
  }

  if (!baseline || !areStringArraysEqual(draft.imageUrls, baseline.imageUrls)) {
    payload.images = draft.imageUrls ?? [];
  }

  return payload;
}

function getSaveStateMessage(locale: Locale, saveState: SaveState) {
  if (saveState.message) {
    return saveState.message;
  }

  switch (saveState.messageKey) {
    case "noChanges":
      return localizedText(locale, "Inga ändringar att spara.", "No changes to save.");
    case "tagsStillLoading":
      return localizedText(
        locale,
        "Taggar laddas fortfarande. Försök igen om en stund.",
        "Tags are still loading. Try again in a moment."
      );
    case "tagsUnavailable":
      return localizedText(
        locale,
        "Kunde inte spara taggar eftersom de inte kunde laddas.",
        "Could not save tags because they could not be loaded."
      );
    case "saved":
      return localizedText(locale, "Ändringarna är sparade.", "Your changes have been saved.");
    case "saveFailed":
      return localizedText(locale, "Kunde inte spara ändringarna.", "Could not save changes.");
    default:
      return null;
  }
}

function getTagsErrorMessage(locale: Locale, error: string | null) {
  if (!error) {
    return null;
  }

  return error === genericTagsLoadError
    ? localizedText(locale, "Kunde inte ladda taggar.", "Could not load tags.")
    : error;
}

function InlineLabel({ children }: { children: string }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
      {children}
    </span>
  );
}

function EditableListingPreview({
  locale,
  draft,
  galleryImages,
  availableTags,
  tagsLoading,
  tagsError,
  onImageEdit,
  onDraftChange,
  onNumberChange,
}: {
  locale: Locale;
  draft: EditableListingDraft;
  galleryImages: string[];
  availableTags: ListingTagDTO[];
  tagsLoading: boolean;
  tagsError: string | null;
  onImageEdit: () => void;
  onDraftChange: (patch: Partial<EditableListingDraft>) => void;
  onNumberChange: (key: "rent" | "rooms" | "sizeM2", value: string) => void;
}) {
  const selectedTags = draft.tags ?? [];
  const toggleTag = (tag: ListingTagDTO) => {
    const selected = isTagSelected(selectedTags, tag);
    const endpointTag = normalizeTagIdentifier(tag);

    if (!endpointTag) {
      return;
    }

    onDraftChange({
      tags: selected
        ? selectedTags.filter(
            (selectedTag) =>
              !getTagSelectionKeys(tag).includes(normalizeTagKey(selectedTag))
          )
        : [...selectedTags, endpointTag],
    });
  };

  return (
    <section
      aria-label={localizedText(locale, "Förhandsvisning", "Preview")}
      className="mx-auto flex w-full max-w-6xl flex-col gap-10"
    >
      <div className="relative">
        {galleryImages.length > 0 ? (
          <BostadImagePreviewGrid images={galleryImages} readOnly />
        ) : (
          <div className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
            {localizedText(
              locale,
              "Inga bilder visas i förhandsvisningen.",
              "No images are shown in the preview."
            )}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={onImageEdit}
          className={`${imageEditButtonClass} absolute right-4 top-4`}
        >
          <Pencil className="h-4 w-4" />
          {localizedText(locale, "Bilder", "Images")}
        </Button>
      </div>

      <section className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <input
                aria-label={localizedText(locale, "Titel", "Title")}
                value={draft.title ?? ""}
                onChange={(event) => onDraftChange({ title: event.target.value })}
                className={`${inlineInputClass} -mx-2 w-full text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl`}
                placeholder={localizedText(locale, "Titel", "Title")}
              />

              <div className="mt-4 grid gap-3 text-sm text-gray-600">
                <div className="grid gap-1">
                  <InlineLabel>{localizedText(locale, "Plats", "Location")}</InlineLabel>
                  <div className="flex flex-wrap items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-green-700" />
                    <input
                      aria-label={localizedText(locale, "Adress", "Address")}
                      value={draft.fullAddress ?? ""}
                      readOnly
                      className={`${inlineInputClass} w-full flex-1 font-medium sm:min-w-[220px]`}
                      placeholder={localizedText(locale, "Adress", "Address")}
                    />
                    <input
                      aria-label={localizedText(locale, "Område", "Area")}
                      value={draft.area ?? ""}
                      readOnly
                      className={`${inlineInputClass} w-full font-medium sm:w-40`}
                      placeholder={localizedText(locale, "Område", "Area")}
                    />
                    <input
                      aria-label={localizedText(locale, "Stad", "City")}
                      value={draft.city ?? ""}
                      readOnly
                      className={`${inlineInputClass} w-full font-medium sm:w-40`}
                      placeholder={localizedText(locale, "Stad", "City")}
                    />
                  </div>
                </div>

                <div className="grid gap-1">
                  <InlineLabel>{localizedText(locale, "Bostad", "Dwelling")}</InlineLabel>
                  <div className="flex flex-wrap items-center gap-2">
                    <Home className="h-4 w-4 shrink-0 text-green-700" />
                    <input
                      aria-label={localizedText(locale, "Rum", "Rooms")}
                      type="number"
                      value={draft.rooms ?? ""}
                      onChange={(event) => onNumberChange("rooms", event.target.value)}
                      className={`${inlineInputClass} w-20 font-medium`}
                      placeholder={localizedText(locale, "Rum", "Rooms")}
                    />
                    <span className="font-medium">
                      {localizedText(locale, "rum", "rooms")}
                    </span>
                    <input
                      aria-label={localizedText(locale, "Storlek", "Size")}
                      type="number"
                      value={draft.sizeM2 ?? ""}
                      onChange={(event) => onNumberChange("sizeM2", event.target.value)}
                      className={`${inlineInputClass} w-24 font-medium`}
                      placeholder="m²"
                    />
                    <span className="font-medium">m²</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-y-4">
                {[
                  {
                    label: localizedText(locale, "Tillgänglig från", "Available from"),
                    key: "availableFrom" as const,
                  },
                  {
                    label: localizedText(locale, "Tillgänglig till", "Available until"),
                    key: "availableTo" as const,
                  },
                  {
                    label: localizedText(locale, "Sista ansökan", "Application deadline"),
                    key: "applyBy" as const,
                  },
                ].map((item, index) => (
                  <div
                    key={item.key}
                    className={`flex min-w-[150px] flex-1 flex-col pr-4 sm:flex-none ${
                      index > 0 ? "sm:border-l sm:border-gray-200 sm:pl-4" : ""
                    }`}
                  >
                    <InlineLabel>{item.label}</InlineLabel>
                    <input
                      aria-label={item.label}
                      type="date"
                      value={toDateInputValue(draft[item.key])}
                      onChange={(event) =>
                        onDraftChange({
                          [item.key]: event.target.value || null,
                        } as Partial<EditableListingDraft>)
                      }
                      className={`${inlineInputClass} mt-1 w-full text-sm font-medium text-gray-900 sm:-mx-2 sm:w-40`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-1 lg:items-end">
              <InlineLabel>{localizedText(locale, "Månadshyra", "Monthly rent")}</InlineLabel>
              <div className="flex items-baseline gap-1.5">
                <input
                  aria-label={localizedText(locale, "Månadshyra", "Monthly rent")}
                  type="number"
                  value={draft.rent ?? ""}
                  onChange={(event) => onNumberChange("rent", event.target.value)}
                  className={`${inlineInputClass} w-40 text-right text-2xl font-bold tracking-tight text-gray-900`}
                  placeholder={localizedText(locale, "Hyra", "Rent")}
                />
                <span className="text-sm font-medium text-gray-400">
                  {localizedText(locale, "kr/mån", "SEK/mo")}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <InlineLabel>{localizedText(locale, "Taggar", "Tags")}</InlineLabel>
            {tagsLoading ? (
              <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-500">
                {localizedText(locale, "Laddar taggar...", "Loading tags...")}
              </div>
            ) : tagsError ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-800">
                {tagsError}
              </div>
            ) : availableTags.length === 0 ? (
              <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-500">
                {localizedText(
                  locale,
                  "Inga taggar finns tillgängliga.",
                  "No tags are available."
                )}
              </div>
            ) : (
              <div
                className="flex flex-wrap gap-2"
                aria-label={localizedText(locale, "Taggar", "Tags")}
              >
                {availableTags.map((tag) => {
                  const selected = isTagSelected(selectedTags, tag);

                  return (
                    <button
                      key={normalizeTagIdentifier(tag)}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                        selected
                          ? "border-[#004225] bg-[#004225] text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-[#004225]/35 hover:bg-[#004225]/[0.035]"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {getAppIconElement(tag.icon || tag.tagKey || tag.displayName, "h-4 w-4")}
                      {tag.displayName}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            <input
              type="hidden"
              aria-label={localizedText(locale, "Taggar", "Tags")}
              value={(draft.tags ?? []).join(", ")}
              readOnly
            />
          </div>

          <div className="mt-2">
            <h2 className="mb-2 border-b border-gray-100 pb-2 text-lg font-semibold text-gray-900">
              {localizedText(locale, "Om boendet", "About the dwelling")}
            </h2>
            <RichTextTextarea
              aria-label={localizedText(locale, "Beskrivning", "Description")}
              value={draft.description ?? ""}
              onValueChange={(value) => onDraftChange({ description: value })}
              className={`${inlineInputClass} min-h-44 w-full resize-y text-[15px] leading-relaxed text-gray-700`}
              placeholder={localizedText(locale, "Beskriv bostaden", "Describe the dwelling")}
            />
          </div>
        </div>
      </section>
    </section>
  );
}

export default function ListingEditView({ id }: ListingEditViewProps) {
  const { locale } = useI18n();
  const { user } = useAuth();
  const activeCompanyId = getActiveCompanyId(user);
  // The editor keeps an in-page mirror of the listing (`listing`) plus a
  // working `draft`. The server data comes from useListing/useListingTags
  // hooks; we hydrate `listing`+`draft` from `useListing.data` once and only
  // overwrite when the id changes (so opening a new listing in the same view
  // resets the editor).
  const [listing, setListing] = useState<EditableListingDraft | null>(null);
  const [draft, setDraft] = useState<EditableListingDraft | null>(null);
  const preserveDraftOnNextImageHydrationRef = useRef(false);
  const [saveState, setSaveState] = useState<SaveState>(emptySaveState);
  const [uploadGalleryVisible, setUploadGalleryVisible] = useState(false);
  const updateListing = useUpdateListing();
  const uploadCompanyPublicMedia = useUploadCompanyPublicMedia();

  const {
    data: serverListing,
    isLoading: listingLoading,
    isError: isListingError,
    error: listingErr,
  } = useListing(id);
  const {
    data: listingTags = [],
    isLoading: listingTagsLoading,
    isError: isListingTagsError,
  } = useListingTags();

  const loading = listingLoading;
  const error =
    isListingError && listingErr
      ? listingErr instanceof Error
        ? listingErr.message
        : "Kunde inte ladda annonsen."
      : null;
  const listingTagsError = isListingTagsError ? "Kunde inte ladda taggar." : null;

  // Hydrate the in-page editor state from the cached server listing. Re-runs
  // when the id (a different listing) or the server payload changes — this
  // keeps the draft in sync after a successful save invalidates the cache.
  useEffect(() => {
    if (!serverListing) {
      setListing(null);
      setDraft(null);
      return;
    }
    const normalized = cloneEditableListing(serverListing);

    if (preserveDraftOnNextImageHydrationRef.current) {
      preserveDraftOnNextImageHydrationRef.current = false;
      setListing((current) =>
        current
          ? { ...current, imageUrls: [...(normalized.imageUrls ?? [])] }
          : normalized
      );
      setDraft((current) =>
        current
          ? { ...current, imageUrls: [...(normalized.imageUrls ?? [])] }
          : { ...normalized, imageUrls: [...(normalized.imageUrls ?? [])] }
      );
      return;
    }

    setListing(normalized);
    setDraft({ ...normalized, imageUrls: [...(normalized.imageUrls ?? [])] });
    setSaveState(emptySaveState);
  }, [serverListing, id]);

  const galleryImages = useMemo(
    () => draft?.imageUrls?.filter(Boolean) ?? [],
    [draft]
  );

  const availableTags = useMemo(() => getSelectableTags(listingTags), [listingTags]);

  const hasUnsavedChanges = useMemo(
    () =>
      getEditableSnapshot(draft, availableTags) !==
      getEditableSnapshot(listing, availableTags),
    [availableTags, draft, listing]
  );

  const updateDraft = (patch: Partial<EditableListingDraft>) => {
    setDraft((current) => (current ? { ...current, ...patch } : current));
    setSaveState(emptySaveState);
  };

  const updateNumber = (key: "rent" | "rooms" | "sizeM2", value: string) => {
    const parsed = value === "" ? null : Number(value);
    updateDraft({
      [key]: normalizeNumberValue(parsed),
    } as Partial<EditableListingDraft>);
  };

  const uploadGalleryImages = async (files: File[]) => {
    if (!draft) {
      throw new Error(
        localizedText(locale, "Annonsen kunde inte hittas.", "The listing could not be found.")
      );
    }

    const companyId = getUploadCompanyId(draft, activeCompanyId);
    if (companyId == null) {
      throw new Error(
        localizedText(
          locale,
          "Kunde inte ladda upp bilder eftersom foretaget saknas.",
          "Could not upload images because the company is missing."
        )
      );
    }

    return Promise.all(
      files.map((file) =>
        uploadCompanyPublicMedia.mutateAsync({
          companyId,
          file,
        })
      )
    );
  };

  const persistGalleryImages = async (imageUrls: string[]) => {
    const nextImageUrls = imageUrls.filter(Boolean);
    const previousDraftImageUrls = draft?.imageUrls ?? [];
    const previousListingImageUrls = listing?.imageUrls ?? [];

    preserveDraftOnNextImageHydrationRef.current = true;
    setSaveState({ status: "saving", message: null });
    setDraft((current) =>
      current ? { ...current, imageUrls: [...nextImageUrls] } : current
    );
    setListing((current) =>
      current ? { ...current, imageUrls: [...nextImageUrls] } : current
    );

    try {
      await updateListing.mutateAsync({
        id,
        payload: { images: nextImageUrls },
      });
      setSaveState({
        status: "success",
        message: null,
        messageKey: "saved",
      });
    } catch (error) {
      preserveDraftOnNextImageHydrationRef.current = false;
      setDraft((current) =>
        current ? { ...current, imageUrls: previousDraftImageUrls } : current
      );
      setListing((current) =>
        current ? { ...current, imageUrls: previousListingImageUrls } : current
      );
      setSaveState({
        status: "error",
        message: error instanceof Error ? error.message : null,
        messageKey: error instanceof Error ? undefined : "saveFailed",
      });
      throw error;
    }
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return;

    const payload = createUpdatePayload(draft, listing, availableTags);

    if (Object.keys(payload).length === 0) {
      const nextSaveState: SaveState = {
        status: "success",
        message: null,
        messageKey: "noChanges",
      };
      setSaveState(nextSaveState);
      toast.info(getSaveStateMessage(locale, nextSaveState));
      return;
    }

    if (payload.tags && listingTagsLoading) {
      const nextSaveState: SaveState = {
        status: "error",
        message: null,
        messageKey: "tagsStillLoading",
      };
      setSaveState(nextSaveState);
      toast.error(getSaveStateMessage(locale, nextSaveState));
      return;
    }

    if (payload.tags && listingTagsError) {
      const nextSaveState: SaveState = {
        status: "error",
        message: null,
        messageKey: "tagsUnavailable",
      };
      setSaveState(nextSaveState);
      toast.error(getSaveStateMessage(locale, nextSaveState));
      return;
    }

    setSaveState({ status: "saving", message: null });

    try {
      preserveDraftOnNextImageHydrationRef.current = false;
      // Mutation hook owns invalidation (listings.all + queues.all). The
      // useListing query re-fetches and the hydration effect re-seeds draft.
      await updateListing.mutateAsync({ id, payload });
      const nextSaveState: SaveState = {
        status: "success",
        message: null,
        messageKey: "saved",
      };
      setSaveState(nextSaveState);
      toast.success(getSaveStateMessage(locale, nextSaveState));
    } catch (err) {
      const nextSaveState: SaveState = {
        status: "error",
        message:
          err instanceof Error
            ? err.message
            : null,
        messageKey: err instanceof Error ? undefined : "saveFailed",
      };
      setSaveState(nextSaveState);
      toast.error(getSaveStateMessage(locale, nextSaveState));
    }
  };

  const resetDraft = () => {
    if (!listing) return;
    setDraft({ ...listing, imageUrls: [...(listing.imageUrls ?? [])] });
    setSaveState(emptySaveState);
  };

  const openImageEditor = () => setUploadGalleryVisible(true);
  const tagsErrorMessage = getTagsErrorMessage(locale, listingTagsError);

  if (loading) {
    return (
      <main className="pb-12">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-12 text-center text-gray-500 shadow-theme-xs">
          {localizedText(locale, "Laddar annons...", "Loading listing...")}
        </div>
      </main>
    );
  }

  if (error || !draft) {
    return (
      <main className="pb-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center text-red-800">
          {error ?? localizedText(locale, "Annonsen kunde inte hittas.", "The listing could not be found.")}
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="pb-12">
        <PortalPageHeader
          className="mb-6"
          title={localizedText(locale, "Redigera annons", "Edit listing")}
          description={localizedText(
            locale,
            "Finjustera annonsens information, bilder, fakta och taggar.",
            "Refine the listing's information, images, facts and tags."
          )}
        />

        <form onSubmit={handleSave} className="grid gap-6">
          <EditableListingPreview
            locale={locale}
            draft={draft}
            galleryImages={galleryImages}
            availableTags={availableTags}
            tagsLoading={listingTagsLoading}
            tagsError={tagsErrorMessage}
            onImageEdit={openImageEditor}
            onDraftChange={updateDraft}
            onNumberChange={updateNumber}
          />

          <div className="sticky bottom-4 z-10 mx-auto flex w-full max-w-6xl flex-col gap-3 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {hasUnsavedChanges ? (
                <span className="inline-flex w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  {localizedText(locale, "Osparade ändringar", "Unsaved changes")}
                </span>
              ) : (
                <span className="text-sm text-gray-500">
                  {localizedText(locale, "Alla ändringar är sparade.", "All changes are saved.")}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="submit"
                isLoading={saveState.status === "saving"}
                isDisabled={saveState.status === "saving"}
              >
                {localizedText(locale, "Spara ändringar", "Save changes")}
              </Button>
              {hasUnsavedChanges && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetDraft}
                  isDisabled={saveState.status === "saving"}
                >
                  {localizedText(locale, "Återställ", "Reset")}
                </Button>
              )}
            </div>
          </div>
        </form>
      </main>

      <ImageUploadGallery
        open={uploadGalleryVisible}
        setOpen={setUploadGalleryVisible}
        imageUrls={draft.imageUrls}
        onUploadImages={uploadGalleryImages}
        onSave={persistGalleryImages}
        locale={locale}
      />
    </>
  );
}
