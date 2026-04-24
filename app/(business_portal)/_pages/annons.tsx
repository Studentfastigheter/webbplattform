"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { CalendarDays, Home, ImageIcon, MapPin, Tags } from "lucide-react";

import BostadAbout from "@/components/ads/BostadAbout";
import BostadImagePreviewGrid from "@/components/ads/BostadImagePreviewGrid";
import ImageUploadGallery from "@/components/Dashboard/ImageUploadGallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

function FieldGroup({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className ? `grid gap-2 ${className}` : "grid gap-2"}>
      <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </Label>
      {children}
    </div>
  );
}

function FormSection({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#004225]/5 text-[#004225]">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
      </div>
      {children}
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
      rent: draft.rent,
      rooms: draft.rooms,
      sizeM2: draft.sizeM2,
      availableFrom: toDateInputValue(draft.availableFrom) || null,
      availableTo: toDateInputValue(draft.availableTo) || null,
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

        <div className="grid gap-8">
          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Förhandsvisning</h2>
              <p className="mt-1 text-sm text-gray-600">
                Så här visas annonsen på plattformen.
              </p>
            </div>

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
              {galleryImages.length > 0 ? (
                <BostadImagePreviewGrid images={galleryImages} readOnly />
              ) : (
                <div className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
                  Inga bilder visas i förhandsvisningen.
                </div>
              )}

              <BostadAbout listing={draft} hideStudentActions />
            </div>
          </section>

          <form onSubmit={handleSave} className="flex flex-col gap-5">
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Korrigera information</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Fälten uppdaterar förhandsvisningen direkt.
                  </p>
                </div>
                {hasUnsavedChanges && (
                  <span className="inline-flex w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                    Osparade ändringar
                  </span>
                )}
              </div>

              <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="grid gap-5">
                  <FormSection
                    title="Grundinformation"
                    description="Det som visas först i annonsen."
                    icon={<Home className="h-4 w-4" />}
                  >
                    <div className="grid gap-4 lg:grid-cols-2">
                      <FieldGroup label="Titel">
                        <Input
                          value={draft.title}
                          onChange={(event) => updateDraft({ title: event.target.value })}
                        />
                      </FieldGroup>
                      <FieldGroup label="Bostadstyp">
                        <Input
                          value={draft.dwellingType}
                          onChange={(event) => updateDraft({ dwellingType: event.target.value })}
                        />
                      </FieldGroup>
                      <FieldGroup label="Månadshyra">
                        <Input
                          type="number"
                          value={draft.rent ?? ""}
                          onChange={(event) => updateNumber("rent", event.target.value)}
                        />
                      </FieldGroup>
                      <div className="grid grid-cols-2 gap-3">
                        <FieldGroup label="Rum">
                          <Input
                            type="number"
                            value={draft.rooms ?? ""}
                            onChange={(event) => updateNumber("rooms", event.target.value)}
                          />
                        </FieldGroup>
                        <FieldGroup label="Storlek">
                          <Input
                            type="number"
                            value={draft.sizeM2 ?? ""}
                            onChange={(event) => updateNumber("sizeM2", event.target.value)}
                          />
                        </FieldGroup>
                      </div>
                    </div>
                  </FormSection>

                  <FormSection
                    title="Plats"
                    description="Adress och geografisk information."
                    icon={<MapPin className="h-4 w-4" />}
                  >
                    <div className="grid gap-4 lg:grid-cols-2">
                      <FieldGroup label="Adress" className="lg:col-span-2">
                        <Input
                          value={draft.fullAddress ?? ""}
                          onChange={(event) => updateDraft({ fullAddress: event.target.value })}
                        />
                      </FieldGroup>
                      <FieldGroup label="Område">
                        <Input
                          value={draft.area}
                          onChange={(event) => updateDraft({ area: event.target.value })}
                        />
                      </FieldGroup>
                      <FieldGroup label="Stad">
                        <Input
                          value={draft.city}
                          onChange={(event) => updateDraft({ city: event.target.value })}
                        />
                      </FieldGroup>
                    </div>
                  </FormSection>

                  <FormSection
                    title="Beskrivning"
                    description="Texten som beskriver bostaden."
                    icon={<Tags className="h-4 w-4" />}
                  >
                    <div className="grid gap-4">
                      <FieldGroup label="Tags">
                        <div className="grid gap-1.5">
                          <Input
                            value={(draft.tags ?? []).join(", ")}
                            onChange={(event) =>
                              updateDraft({
                                tags: event.target.value
                                  .split(",")
                                  .map((tag) => tag.trim())
                                  .filter(Boolean),
                              })
                            }
                            placeholder="Ex. Möblerat, Balkong, Poängfri"
                          />
                          <p className="text-xs text-gray-500">
                            Separera med komma tills tags kan väljas från databasen.
                          </p>
                        </div>
                      </FieldGroup>

                      <FieldGroup label="Beskrivning">
                        <Textarea
                          value={draft.description ?? ""}
                          onChange={(event) => updateDraft({ description: event.target.value })}
                          className="min-h-44 resize-y"
                        />
                      </FieldGroup>
                    </div>
                  </FormSection>
                </div>

                <div className="grid content-start gap-5">
                  <FormSection
                    title="Bilder"
                    description="Ordning och huvudbild hanteras här."
                    icon={<ImageIcon className="h-4 w-4" />}
                  >
                    <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">
                      <span className="text-sm text-gray-700">
                        {galleryImages.length > 0
                          ? `${galleryImages.length} bilder uppladdade`
                          : "Inga bilder uppladdade"}
                      </span>
                      <Button type="button" variant="outline" onClick={openImageEditor}>
                        Redigera
                      </Button>
                    </div>
                  </FormSection>

                  <FormSection
                    title="Datum"
                    description="Publicerade datum i annonsinformationen."
                    icon={<CalendarDays className="h-4 w-4" />}
                  >
                    <div className="grid gap-4">
                      <FieldGroup label="Tillgänglig från">
                        <Input
                          type="date"
                          value={toDateInputValue(draft.availableFrom)}
                          onChange={(event) => updateDraft({ availableFrom: event.target.value || null })}
                        />
                      </FieldGroup>
                      <FieldGroup label="Tillgänglig till">
                        <Input
                          type="date"
                          value={toDateInputValue(draft.availableTo)}
                          onChange={(event) => updateDraft({ availableTo: event.target.value || null })}
                        />
                      </FieldGroup>
                      <FieldGroup label="Inflyttning">
                        <Input
                          type="date"
                          value={toDateInputValue(draft.moveIn)}
                          onChange={(event) => updateDraft({ moveIn: event.target.value || null })}
                        />
                      </FieldGroup>
                      <FieldGroup label="Sista ansökan">
                        <Input
                          type="date"
                          value={toDateInputValue(draft.applyBy)}
                          onChange={(event) => updateDraft({ applyBy: event.target.value || null })}
                        />
                      </FieldGroup>
                    </div>
                  </FormSection>
                </div>
              </div>

              {saveState.message && (
                <div
                  className={
                    saveState.status === "error"
                      ? "mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                      : "mt-5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800"
                  }
                >
                  {saveState.message}
                </div>
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
          </form>
        </div>
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
