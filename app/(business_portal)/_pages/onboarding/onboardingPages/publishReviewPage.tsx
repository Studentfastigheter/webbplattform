"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Eye,
  Home,
  ImageIcon,
  MapPin,
  Tags,
} from "lucide-react";
import { toast } from "sonner";

import BostadAbout from "@/components/ads/BostadAbout";
import BostadImagePreviewGrid from "@/components/ads/BostadImagePreviewGrid";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api-client";
import { listingService } from "@/services/listing-service";
import type { ListingDetailDTO, PublishListingRequest } from "@/types/listing";
import { dashboardRelPath } from "@/app/(business_portal)/_statics/variables";
import {
  buildPublishListingRequest,
  useListingDraft,
  validateListingDraft,
  type ListingDraft,
} from "../listingDraftContext";

const DWELLING_LABELS: Record<string, string> = {
  APARTMENT: "Lägenhet",
  ROOM: "Rum",
  CORRIDOR_ROOM: "Korridorsrum",
};

const TAG_LABELS: Record<string, string> = {
  BALCONY: "Balkong",
  DISHWASHER: "Diskmaskin",
  PARKING: "Parkering",
  PET_FRIENDLY: "Husdjur tillåtna",
  ELEVATOR: "Hiss",
  LAUNDRY: "Tvättmöjlighet",
  FURNISHED: "Möblerad",
  INTERNET_INCLUDED: "Internet ingår",
  ELECTRICITY_INCLUDED: "Elektricitet ingår",
  WARM_WATER_INCLUDED: "Varmvatten ingår",
};

function formatTag(tag: string) {
  return TAG_LABELS[tag] ?? tag;
}

function formatDwellingType(type: string) {
  return DWELLING_LABELS[type] ?? type;
}

function formatCurrency(value?: number) {
  return value ? `${value.toLocaleString("sv-SE")} kr/mån` : "Ej angiven";
}

function formatArea(value?: number) {
  return value ? `${value} m²` : "Ej angiven";
}

function valueOrFallback(value?: string | null) {
  return value?.trim() || "Ej angiven";
}

function buildPreviewListing({
  draft,
  ownerId,
  ownerLogoUrl,
  ownerName,
  payload,
  verifiedOwner,
}: {
  draft: ListingDraft;
  ownerId: number;
  ownerLogoUrl?: string | null;
  ownerName: string;
  payload: PublishListingRequest;
  verifiedOwner: boolean;
}): ListingDetailDTO {
  return {
    id: "new-listing-preview",
    title: payload.title || "Titel saknas",
    city: payload.city || "Stad saknas",
    area: payload.area ?? draft.postalCode.trim(),
    fullAddress: payload.address || null,
    rent: payload.rent ?? 0,
    dwellingType: formatDwellingType(payload.dwellingType),
    rooms: payload.rooms ?? 0,
    sizeM2: payload.sizeM2 ?? null,
    description: payload.description || "Beskrivningen visas här när den är ifylld.",
    tags: payload.tags.map(formatTag),
    imageUrls: payload.images,
    applyBy: payload.applyBy ?? null,
    availableFrom: payload.availableFrom ?? null,
    availableTo: payload.availableTo ?? null,
    moveIn: payload.availableFrom ?? null,
    ownerType: "company",
    ownerName,
    ownerLogoUrl,
    ownerId,
    verifiedOwner,
  };
}

function ReviewRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex gap-3 border-b border-gray-100 py-3 last:border-b-0">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-500">
        {icon}
      </div>
      <div className="min-w-0">
        <dt className="text-xs font-medium uppercase text-gray-500">{label}</dt>
        <dd className="mt-1 break-words text-sm text-gray-900">{value}</dd>
      </div>
    </div>
  );
}

function MissingFieldsNotice({ fields }: { fields: string[] }) {
  if (fields.length === 0) {
    return (
      <div className="flex gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="font-semibold">Annonsen är redo att publiceras.</p>
          <p className="mt-1 text-emerald-800">
            Kontrollera previewn en sista gång innan den skickas till plattformen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p className="font-semibold">Komplettera innan publicering</p>
        <p className="mt-1 text-amber-800">{fields.join(", ")}.</p>
      </div>
    </div>
  );
}

export default function PublishReviewPage() {
  const router = useRouter();
  const { refreshUser, token, user } = useAuth();
  const { draft, resetDraft } = useListingDraft();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const missingFields = useMemo(() => validateListingDraft(draft), [draft]);
  const payload = useMemo(() => buildPublishListingRequest(draft), [draft]);
  const canPublish = missingFields.length === 0 && !isSubmitting;
  const ownerName = user?.companyName ?? user?.displayName ?? "CampusLyan";
  const previewListing = useMemo(
    () =>
      buildPreviewListing({
        draft,
        ownerId: user?.id ?? 0,
        ownerLogoUrl: user?.logoUrl ?? null,
        ownerName,
        payload,
        verifiedOwner: user?.verified ?? false,
      }),
    [draft, ownerName, payload, user?.id, user?.logoUrl, user?.verified],
  );

  const handlePublish = async () => {
    const missing = validateListingDraft(draft);
    if (missing.length > 0) {
      toast.error(`Fyll i saknade fält: ${missing.join(", ")}`);
      return;
    }

    if (!token) {
      toast.error("Du behöver logga in igen innan annonsen kan publiceras.");
      return;
    }

    if (user?.accountType !== "company") {
      toast.error("Endast företagskonton kan publicera annonser i portalen.");
      return;
    }

    setIsSubmitting(true);
    try {
      await refreshUser();
      await listingService.publish(payload);
      resetDraft();
      toast.success("Annonsen har publicerats.");
      router.push(`${dashboardRelPath}/annonser`);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        toast.error(
          "Backend nekade publicering. Kontrollera att du är inloggad med ett företagskonto och att JWT-tokenen har COMPANY-behörighet.",
        );
        return;
      }

      toast.error(
        error instanceof Error
          ? error.message
          : "Kunde inte publicera annonsen.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-gray-500">Sista steget</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
            Granska och publicera
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Previewn visar annonsen med samma struktur som studenterna möter på
            plattformen.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
          <Eye className="h-4 w-4 text-[#004225]" />
          Livepreview
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <section className="min-w-0 space-y-6">
          <div className="rounded-md border border-gray-200 bg-white p-2">
            {previewListing.imageUrls.length > 0 ? (
              <BostadImagePreviewGrid images={previewListing.imageUrls} readOnly />
            ) : (
              <div className="flex h-[320px] flex-col items-center justify-center gap-3 rounded-md border border-dashed border-gray-300 bg-white text-center text-sm text-gray-500">
                <ImageIcon className="h-8 w-8 text-gray-400" />
                Lägg till bilder för att se annonsens bildyta i previewn.
              </div>
            )}
          </div>

          <BostadAbout listing={previewListing} hideStudentActions />
        </section>

        <aside className="space-y-5 xl:sticky xl:top-6">
          <MissingFieldsNotice fields={missingFields} />

          <section className="rounded-md border border-gray-200 bg-white p-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Sammanfattning</h2>
              <p className="mt-1 text-sm text-gray-500">
                Uppgifter som skickas in vid publicering.
              </p>
            </div>

            <dl className="mt-4">
              <ReviewRow
                icon={<Home className="h-4 w-4" />}
                label="Bostad"
                value={`${formatDwellingType(payload.dwellingType)} · ${payload.rooms ?? "-"} rum · ${formatArea(payload.sizeM2)}`}
              />
              <ReviewRow
                icon={<MapPin className="h-4 w-4" />}
                label="Plats"
                value={[valueOrFallback(payload.address), valueOrFallback(payload.city)]
                  .filter(Boolean)
                  .join(", ")}
              />
              <ReviewRow
                icon={<Home className="h-4 w-4" />}
                label="Hyra"
                value={formatCurrency(payload.rent)}
              />
              <ReviewRow
                icon={<Tags className="h-4 w-4" />}
                label="Taggar"
                value={payload.tags.length > 0 ? payload.tags.map(formatTag).join(", ") : "Inga taggar"}
              />
              <ReviewRow
                icon={<ImageIcon className="h-4 w-4" />}
                label="Bilder"
                value={`${payload.images.length} ${payload.images.length === 1 ? "bild" : "bilder"}`}
              />
              <ReviewRow
                icon={<CalendarDays className="h-4 w-4" />}
                label="Datum"
                value={[
                  payload.applyBy ? `Sista ansökan ${payload.applyBy}` : null,
                  payload.availableFrom ? `Från ${payload.availableFrom}` : null,
                  payload.availableTo ? `Till ${payload.availableTo}` : null,
                ].filter(Boolean).join(" · ") || "Inga datum angivna"}
              />
            </dl>

            <div className="mt-6 grid gap-3">
              <Button
                type="button"
                onClick={handlePublish}
                isLoading={isSubmitting}
                isDisabled={!canPublish}
                fullWidth
              >
                Publicera annons
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetDraft}
                isDisabled={isSubmitting}
                fullWidth
              >
                Rensa utkast
              </Button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
