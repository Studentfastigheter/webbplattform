"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Home, MapPin, Pencil } from "lucide-react";

import BostadImagePreviewGrid from "@/components/ads/BostadImagePreviewGrid";
import ImageUploadGallery from "@/components/Dashboard/ImageUploadGallery";
import { Button } from "@/components/ui/button";
import { listingService } from "@/services/listing-service";
import { ListingDetailDTO, UpdateListingRequest } from "@/types/listing";

type AnnonsPageProps = {
  id: string;
};

type SaveState = {
  status: "idle" | "saving" | "success" | "error";
  message: string | null;
};

const emptySaveState: SaveState = {
  status: "idle",
  message: null,
};

const inlineInputClass =
  "min-w-0 rounded-md border border-[#004225]/10 bg-[#004225]/[0.035] px-2 py-1 outline-none transition hover:border-[#004225]/25 hover:bg-white focus:border-[#004225] focus:bg-white focus:ring-4 focus:ring-[#004225]/10";

function toDateInputValue(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

function getEditableSnapshot(listing: ListingDetailDTO | null) {
  if (!listing) return "";

  return JSON.stringify({
    title: listing.title,
    fullAddress: listing.fullAddress ?? "",
    area: listing.area,
    city: listing.city,
    rent: listing.rent,
    dwellingType: listing.dwellingType,
    rooms: listing.rooms,
    sizeM2: listing.sizeM2,
    availableFrom: toDateInputValue(listing.availableFrom),
    availableTo: toDateInputValue(listing.availableTo),
    moveIn: toDateInputValue(listing.moveIn),
    applyBy: toDateInputValue(listing.applyBy),
    tags: listing.tags ?? [],
    description: listing.description ?? "",
    imageUrls: listing.imageUrls ?? [],
  });
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
  onImageEdit,
  onDraftChange,
  onNumberChange,
}: {
  draft: ListingDetailDTO;
  galleryImages: string[];
  onImageEdit: () => void;
  onDraftChange: (patch: Partial<ListingDetailDTO>) => void;
  onNumberChange: (key: "rent" | "rooms" | "sizeM2", value: string) => void;
}) {
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
                value={draft.title}
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
                      onChange={(event) => onDraftChange({ fullAddress: event.target.value })}
                      className={`${inlineInputClass} min-w-[220px] flex-1 font-medium`}
                      placeholder="Adress"
                    />
                    <input
                      aria-label="Område"
                      value={draft.area}
                      onChange={(event) => onDraftChange({ area: event.target.value })}
                      className={`${inlineInputClass} w-40 font-medium`}
                      placeholder="Område"
                    />
                    <input
                      aria-label="Stad"
                      value={draft.city}
                      onChange={(event) => onDraftChange({ city: event.target.value })}
                      className={`${inlineInputClass} w-40 font-medium`}
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
                      value={draft.dwellingType}
                      onChange={(event) => onDraftChange({ dwellingType: event.target.value })}
                      className={`${inlineInputClass} min-w-[150px] font-medium`}
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
                  { label: "Inflyttning", key: "moveIn" as const },
                  { label: "Sista ansökan", key: "applyBy" as const },
                ].map((item, index) => (
                  <div
                    key={item.key}
                    className={`flex flex-col pr-4 ${
                      index > 0 ? "border-l border-gray-200 pl-4" : ""
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
                        } as Partial<ListingDetailDTO>)
                      }
                      className={`${inlineInputClass} -mx-2 mt-1 w-40 text-sm font-medium text-gray-900`}
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
            <input
              aria-label="Taggar"
              value={(draft.tags ?? []).join(", ")}
              onChange={(event) =>
                onDraftChange({
                  tags: event.target.value
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                })
              }
              className={`${inlineInputClass} w-full text-sm font-medium text-gray-700`}
              placeholder="Ex. Möblerat, Balkong, Poängfri"
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
  const [listing, setListing] = useState<ListingDetailDTO | null>(null);
  const [draft, setDraft] = useState<ListingDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>(emptySaveState);
  const [uploadGalleryVisible, setUploadGalleryVisible] = useState(false);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);
    setListing(null);
    setDraft(null);
    setSaveState(emptySaveState);

    listingService
      .get(id)
      .then((res) => {
        if (!active) return;
        setListing(res);
        setDraft(res);
      })
      .catch((err: unknown) => {
        if (!active) return;
        console.error("Kunde inte hämta annonsen:", err);
        setError(err instanceof Error ? err.message : "Kunde inte ladda annonsen.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const galleryImages = useMemo(
    () => draft?.imageUrls?.filter(Boolean) ?? [],
    [draft],
  );

  const hasUnsavedChanges = useMemo(
    () => getEditableSnapshot(draft) !== getEditableSnapshot(listing),
    [draft, listing],
  );

  const updateDraft = (patch: Partial<ListingDetailDTO>) => {
    setDraft((current) => (current ? { ...current, ...patch } : current));
    setSaveState(emptySaveState);
  };

  const updateNumber = (key: "rent" | "rooms" | "sizeM2", value: string) => {
    const parsed = value === "" ? null : Number(value);
    updateDraft({
      [key]: Number.isFinite(parsed) ? parsed : null,
    } as Partial<ListingDetailDTO>);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return;

    setSaveState({ status: "saving", message: null });

    const payload: UpdateListingRequest = {
      title: draft.title,
      city: draft.city,
      area: draft.area,
      address: draft.fullAddress ?? null,
      dwellingType: draft.dwellingType,
      rent: draft.rent,
      rooms: draft.rooms,
      sizeM2: draft.sizeM2,
      availableFrom: toDateInputValue(draft.availableFrom) || null,
      availableTo: toDateInputValue(draft.availableTo) || null,
      moveIn: toDateInputValue(draft.moveIn) || null,
      applyBy: toDateInputValue(draft.applyBy) || null,
      tags: draft.tags,
      description: draft.description,
      images: draft.imageUrls,
    };

    try {
      await listingService.update(id, payload);
      const next = await listingService.get(id).catch(() => draft);
      setListing(next);
      setDraft(next);
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
    setDraft(listing);
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
          <p className="text-sm font-medium text-gray-500">Annons</p>
          <h1 className="text-2xl font-semibold text-gray-900">Redigera annons</h1>
        </div>

        <form onSubmit={handleSave} className="grid gap-6">
          <EditableListingPreview
            draft={draft}
            galleryImages={galleryImages}
            onImageEdit={openImageEditor}
            onDraftChange={updateDraft}
            onNumberChange={updateNumber}
          />

          {saveState.message && (
            <div
              className={
                saveState.status === "error"
                  ? "mx-auto w-full max-w-6xl rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                  : "mx-auto w-full max-w-6xl rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800"
              }
            >
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
