"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Home, MapPin, Pencil } from "lucide-react";

import BostadImagePreviewGrid from "@/features/ads/components/BostadImagePreviewGrid";
import ImageUploadGallery from "@/features/business-portal/components/ImageUploadGallery";
import { Button } from "@/components/ui/button";
import { listingService } from "@/features/listings/services/listing-service";
import {
  useListing,
  useListingTags,
} from "@/features/listings/hooks/useListings";
import { qk } from "@/lib/query/keys";
import {
  ListingDetailDTO,
  ListingTagDTO,
  UpdateListingRequest,
} from "@/types/listing";

type AnnonsPageProps = {
  id: string;
};

type SaveState = {
  status: "idle" | "saving" | "success" | "error";
  message: string | null;
};

type EditableListingDraft = Omit<ListingDetailDTO, "tags"> & {
  tags: string[];
};

const emptySaveState: SaveState = {
  status: "idle",
  message: null,
};

const inlineInputClass =
  "min-w-0 rounded-md border border-[#004225]/10 bg-[#004225]/[0.035] px-2 py-1 outline-none transition hover:border-[#004225]/25 hover:bg-white focus:border-[#004225] focus:bg-white focus:ring-4 focus:ring-[#004225]/10";

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

function normalizeTagKey(value: string | ListingTagDTO) {
  return normalizeTagValue(value).toLocaleLowerCase("sv-SE");
}

function normalizeTagList(tags: Array<string | ListingTagDTO> | undefined) {
  const seen = new Set<string>();
  const normalizedTags: string[] = [];

  (tags ?? []).forEach((tag) => {
    const normalizedTag = normalizeTagValue(tag);
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
    const label = normalizeTagValue(tag.displayName);
    const key = normalizeTagKey(label);

    if (!label || seen.has(key)) {
      return;
    }

    seen.add(key);
    selectableTags.push({ ...tag, displayName: label });
  });

  return selectableTags;
}

function isTagSelected(selectedTags: string[], tag: ListingTagDTO) {
  const selectedKeys = new Set(selectedTags.map(normalizeTagKey));
  return selectedKeys.has(normalizeTagKey(tag.displayName));
}

function areStringArraysEqual(left: string[] | undefined, right: string[] | undefined) {
  const normalizedLeft = left ?? [];
  const normalizedRight = right ?? [];

  if (normalizedLeft.length !== normalizedRight.length) {
    return false;
  }

  return normalizedLeft.every((value, index) => value === normalizedRight[index]);
}

function getEndpointTagsFromSelection(
  selectedTags: Array<string | ListingTagDTO> | undefined,
  availableTags: ListingTagDTO[]
) {
  const selectedKeys = new Set(normalizeTagList(selectedTags).map(normalizeTagKey));

  if (availableTags.length === 0) {
    return normalizeTagList(selectedTags);
  }

  return availableTags
    .map((tag) => normalizeTagValue(tag.displayName))
    .filter((tag) => tag && selectedKeys.has(normalizeTagKey(tag)));
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

function InlineLabel({ children }: { children: string }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
      {children}
    </span>
  );
}

function EditableListingPreview({
  draft,
  galleryImages,
  availableTags,
  tagsLoading,
  tagsError,
  onImageEdit,
  onDraftChange,
  onNumberChange,
}: {
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

    onDraftChange({
      tags: selected
        ? selectedTags.filter(
            (selectedTag) =>
              normalizeTagKey(selectedTag) !== normalizeTagKey(tag.displayName)
          )
        : [...selectedTags, tag.displayName],
    });
  };

  return (
    <section
      aria-label="Förhandsvisning"
      className="mx-auto flex w-full max-w-6xl flex-col gap-10"
    >
      <div className="relative">
        {galleryImages.length > 0 ? (
          <BostadImagePreviewGrid images={galleryImages} readOnly />
        ) : (
          <div className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
            Inga bilder visas i förhandsvisningen.
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={onImageEdit}
          className="absolute right-4 top-4 bg-white/95 shadow-sm backdrop-blur"
        >
          <Pencil className="h-4 w-4" />
          Bilder
        </Button>
      </div>

      <section className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <input
                aria-label="Titel"
                value={draft.title ?? ""}
                onChange={(event) => onDraftChange({ title: event.target.value })}
                className={`${inlineInputClass} -mx-2 w-full text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl`}
                placeholder="Titel"
              />

              <div className="mt-4 grid gap-3 text-sm text-gray-600">
                <div className="grid gap-1">
                  <InlineLabel>Plats</InlineLabel>
                  <div className="flex flex-wrap items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-green-700" />
                    <input
                      aria-label="Adress"
                      value={draft.fullAddress ?? ""}
                      readOnly
                      className={`${inlineInputClass} w-full flex-1 font-medium sm:min-w-[220px]`}
                      placeholder="Adress"
                    />
                    <input
                      aria-label="Område"
                      value={draft.area ?? ""}
                      readOnly
                      className={`${inlineInputClass} w-full font-medium sm:w-40`}
                      placeholder="Område"
                    />
                    <input
                      aria-label="Stad"
                      value={draft.city ?? ""}
                      readOnly
                      className={`${inlineInputClass} w-full font-medium sm:w-40`}
                      placeholder="Stad"
                    />
                  </div>
                </div>

                <div className="grid gap-1">
                  <InlineLabel>Bostad</InlineLabel>
                  <div className="flex flex-wrap items-center gap-2">
                    <Home className="h-4 w-4 shrink-0 text-green-700" />
                    <input
                      aria-label="Bostadstyp"
                      value={draft.dwellingType ?? ""}
                      readOnly
                      className={`${inlineInputClass} w-full font-medium sm:w-auto sm:min-w-[150px]`}
                      placeholder="Bostadstyp"
                    />
                    <input
                      aria-label="Rum"
                      type="number"
                      value={draft.rooms ?? ""}
                      onChange={(event) => onNumberChange("rooms", event.target.value)}
                      className={`${inlineInputClass} w-20 font-medium`}
                      placeholder="Rum"
                    />
                    <span className="font-medium">rum</span>
                    <input
                      aria-label="Storlek"
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
                  { label: "Tillgänglig från", key: "availableFrom" as const },
                  { label: "Tillgänglig till", key: "availableTo" as const },
                  { label: "Sista ansökan", key: "applyBy" as const },
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
              <InlineLabel>Månadshyra</InlineLabel>
              <div className="flex items-baseline gap-1.5">
                <input
                  aria-label="Månadshyra"
                  type="number"
                  value={draft.rent ?? ""}
                  onChange={(event) => onNumberChange("rent", event.target.value)}
                  className={`${inlineInputClass} w-40 text-right text-2xl font-bold tracking-tight text-gray-900`}
                  placeholder="Hyra"
                />
                <span className="text-sm font-medium text-gray-400">kr/mån</span>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <InlineLabel>Taggar</InlineLabel>
            {tagsLoading ? (
              <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-500">
                Laddar taggar...
              </div>
            ) : tagsError ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-800">
                {tagsError}
              </div>
            ) : availableTags.length === 0 ? (
              <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-500">
                Inga taggar finns tillgängliga.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2" aria-label="Taggar">
                {availableTags.map((tag) => {
                  const selected = isTagSelected(selectedTags, tag);

                  return (
                    <button
                      key={tag.displayName}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                        selected
                          ? "border-[#004225] bg-[#004225] text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-[#004225]/35 hover:bg-[#004225]/[0.035]"
                      }`}
                    >
                      {tag.displayName}
                    </button>
                  );
                })}
              </div>
            )}
            <input
              type="hidden"
              aria-label="Taggar"
              value={(draft.tags ?? []).join(", ")}
              readOnly
            />
          </div>

          <div className="mt-2">
            <h2 className="mb-2 border-b border-gray-100 pb-2 text-lg font-semibold text-gray-900">
              Om boendet
            </h2>
            <textarea
              aria-label="Beskrivning"
              value={draft.description ?? ""}
              onChange={(event) => onDraftChange({ description: event.target.value })}
              className={`${inlineInputClass} min-h-44 w-full resize-y text-[15px] leading-relaxed text-gray-700`}
              placeholder="Beskriv bostaden"
            />
          </div>
        </div>
      </section>
    </section>
  );
}

export default function Annons({ id }: AnnonsPageProps) {
  // The editor keeps an in-page mirror of the listing (`listing`) plus a
  // working `draft`. The server data comes from useListing/useListingTags
  // hooks; we hydrate `listing`+`draft` from `useListing.data` once and only
  // overwrite when the id changes (so opening a new listing in the same view
  // resets the editor).
  const [listing, setListing] = useState<EditableListingDraft | null>(null);
  const [draft, setDraft] = useState<EditableListingDraft | null>(null);
  const [saveState, setSaveState] = useState<SaveState>(emptySaveState);
  const [uploadGalleryVisible, setUploadGalleryVisible] = useState(false);
  const qc = useQueryClient();

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

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return;

    const payload = createUpdatePayload(draft, listing, availableTags);

    if (Object.keys(payload).length === 0) {
      setSaveState({ status: "success", message: "Inga ändringar att spara." });
      return;
    }

    if (payload.tags && listingTagsLoading) {
      setSaveState({
        status: "error",
        message: "Taggar laddas fortfarande. Försök igen om en stund.",
      });
      return;
    }

    if (payload.tags && listingTagsError) {
      setSaveState({
        status: "error",
        message: "Kunde inte spara taggar eftersom de inte kunde laddas.",
      });
      return;
    }

    setSaveState({ status: "saving", message: null });

    try {
      await listingService.update(id, payload);
      // Drop the detail and any list/search/favorite cache that surfaces this
      // listing. The useListing query above re-fetches and rehydrates the
      // editor via the hydration effect.
      await qc.invalidateQueries({ queryKey: qk.listings.detail(id) });
      await qc.invalidateQueries({ queryKey: qk.listings.all });
      setSaveState({ status: "success", message: "Ändringarna är sparade." });
    } catch (err) {
      setSaveState({
        status: "error",
        message: err instanceof Error ? err.message : "Kunde inte spara ändringarna.",
      });
    }
  };

  const resetDraft = () => {
    if (!listing) return;
    setDraft({ ...listing, imageUrls: [...(listing.imageUrls ?? [])] });
    setSaveState(emptySaveState);
  };

  const openImageEditor = () => setUploadGalleryVisible(true);

  if (loading) {
    return (
      <main className="pb-12">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-12 text-center text-gray-500 shadow-theme-xs">
          Laddar annons...
        </div>
      </main>
    );
  }

  if (error || !draft) {
    return (
      <main className="pb-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center text-red-800">
          {error ?? "Annonsen kunde inte hittas."}
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="pb-12">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Redigera annons</h1>
        </div>

        <form onSubmit={handleSave} className="grid gap-6">
          <EditableListingPreview
            draft={draft}
            galleryImages={galleryImages}
            availableTags={availableTags}
            tagsLoading={listingTagsLoading}
            tagsError={listingTagsError}
            onImageEdit={openImageEditor}
            onDraftChange={updateDraft}
            onNumberChange={updateNumber}
          />

          {saveState.status === "error" && saveState.message && (
            <div className="mx-auto w-full max-w-6xl rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {saveState.message}
            </div>
          )}

          <div className="sticky bottom-4 z-10 mx-auto flex w-full max-w-6xl flex-col gap-3 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {hasUnsavedChanges ? (
                <span className="inline-flex w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  Osparade ändringar
                </span>
              ) : (
                <span className="text-sm text-gray-500">Alla ändringar är sparade.</span>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="submit"
                isLoading={saveState.status === "saving"}
                isDisabled={saveState.status === "saving"}
              >
                Spara ändringar
              </Button>
              {hasUnsavedChanges && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetDraft}
                  isDisabled={saveState.status === "saving"}
                >
                  Återställ
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
        onSave={(imageUrls) => updateDraft({ imageUrls })}
      />
    </>
  );
}
