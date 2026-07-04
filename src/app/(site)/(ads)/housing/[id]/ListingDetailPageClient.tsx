"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight, X } from "@/components/icons";
import { RichTextParagraph } from "@/components/ui/RichText";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { getApplicationVerificationError } from "@/lib/application-eligibility";
import { cn } from "@/lib/utils";

import BostadAbout from "@/features/ads/components/BostadAbout";
import BostadLandlord from "@/features/ads/components/BostadLandlord";
import ImageSlideshow from "@/features/ads/components/ImageSlideshow";
import QueueListings from "@/features/ads/components/QueueListings";

import { listingService } from "@/features/listings/services/listing-service";
import {
  useApplyToListing,
  useFavorites,
  useListing,
  useMyApplications,
  useRequirementsProfile,
  useToggleFavorite,
} from "@/features/listings/hooks/useListings";
import { useQueueCompany } from "@/features/queues/hooks/useQueues";
import {
  canRecordDemographicsForUser,
  demographicsService,
  getClientDeviceType,
  ignoreDemographicsRecordError,
} from "@/features/analytics/services/demographics-service";
import { qk } from "@/lib/query/keys";
import {
  ListingCardDTO,
  RequirementsProfileDTO,
} from "@/types/listing";
import { AdvertiserSummary } from "@/types";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

const ListingsMap = dynamic(() => import("@/components/shared/map/ListingsMap"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[300px] w-full rounded-2xl bg-gray-100 animate-pulse sm:min-h-[360px] sm:rounded-3xl lg:min-h-[420px]" aria-hidden />
  ),
});

const DETAIL_PAGE_CONTAINER_CLASS =
  "mx-auto min-h-screen w-full max-w-7xl bg-white px-4 pb-10 pt-4 sm:px-6 sm:pb-12 lg:px-8 lg:pt-8";
const NEARBY_LISTINGS_PAGE_SIZE = 6;
const NEARBY_LISTINGS_FETCH_SIZE = 60;

// ─── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({
  images,
  startIndex,
  onClose,
}: {
  images: string[];
  startIndex: number;
  onClose: () => void;
}) {
  const { locale } = useI18n();
  const [current, setCurrent] = useState(startIndex);

  // Close on Escape, navigate with arrow keys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % images.length);
      if (e.key === "ArrowLeft") setCurrent((c) => (c - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 px-3 py-16 sm:px-6"
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-4 sm:top-4"
        onClick={onClose}
        aria-label={localizedText(locale, "Stäng", "Close")}
      >
        <X className="h-5 w-5" />
      </button>

      {/* Counter */}
      <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
        {current + 1} / {images.length}
      </span>

      {/* Prev */}
      {images.length > 1 && (
        <button
          className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-4 sm:h-12 sm:w-12"
          onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + images.length) % images.length); }}
          aria-label={localizedText(locale, "Föregående bild", "Previous image")}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Image */}
      <div className="max-h-[calc(100vh-9rem)] max-w-[94vw]" onClick={(e) => e.stopPropagation()}>
        <Image
          src={images[current]}
          alt={localizedText(locale, `Bild ${current + 1}`, `Image ${current + 1}`)}
          width={1600}
          height={1000}
          sizes="94vw"
          className="max-h-[calc(100vh-9rem)] max-w-[94vw] rounded-xl object-contain shadow-2xl"
        />
      </div>

      {/* Next */}
      {images.length > 1 && (
        <button
          className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-4 sm:h-12 sm:w-12"
          onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % images.length); }}
          aria-label={localizedText(locale, "Nästa bild", "Next image")}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex max-w-[94vw] -translate-x-1/2 gap-2 overflow-x-auto px-2 pb-1 sm:bottom-4">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`relative shrink-0 h-14 w-20 overflow-hidden rounded-lg border-2 transition ${
                i === current ? "border-white opacity-100" : "border-transparent opacity-50 hover:opacity-75"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                className="object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const MAX_PREVIEW_IMAGES = 3;
const PREVIEW_IMAGE_CLASS =
  "absolute inset-0 block !h-full !w-full !max-w-none scale-[1.025] object-cover object-center transition duration-300 group-hover:scale-[1.04]";

// ─── Top 3-image preview grid ────────────────────────────────────────────────
function ImagePreviewGrid({
  images,
  onImageClick,
}: {
  images: string[];
  onImageClick: (index: number) => void;
}) {
  const { locale } = useI18n();
  if (images.length === 0) return null;

  const shown = images.slice(0, MAX_PREVIEW_IMAGES);

  if (shown.length === 1) {
    return (
      <button
        type="button"
        className="group relative block aspect-[16/10] w-full overflow-hidden rounded-2xl bg-gray-100 outline-none focus-visible:ring-2 focus-visible:ring-[#004225] focus-visible:ring-offset-2 sm:aspect-[16/9] lg:aspect-[16/8] lg:rounded-3xl"
        onClick={() => onImageClick(0)}
      >
        <Image
          src={shown[0]}
          alt={localizedText(locale, "Bild 1", "Image 1")}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1280px"
          className={PREVIEW_IMAGE_CLASS}
        />
        <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
      </button>
    );
  }

  // 2-3 images: main left + side thumbnails
  const side = shown.slice(1);
  return (
    <div className="grid w-full gap-2 lg:h-[clamp(360px,42vw,520px)] lg:grid-cols-[minmax(0,1.65fr)_minmax(220px,0.75fr)]">
      {/* Main image */}
      <button
        type="button"
        className="group relative aspect-[16/10] overflow-hidden rounded-2xl bg-gray-100 outline-none focus-visible:ring-2 focus-visible:ring-[#004225] focus-visible:ring-offset-2 sm:aspect-[16/9] lg:h-full lg:aspect-auto lg:rounded-l-3xl lg:rounded-r-none"
        onClick={() => onImageClick(0)}
      >
        <Image
          src={shown[0]}
          alt={localizedText(locale, "Bild 1", "Image 1")}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 850px"
          className={PREVIEW_IMAGE_CLASS}
        />
        <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
      </button>

      {/* Side thumbnails */}
      <div
        className={cn(
          "grid gap-2 lg:h-full lg:grid-cols-1",
          side.length === 1 ? "grid-cols-1" : "grid-cols-2 lg:grid-rows-2",
        )}
      >
        {side.map((src, i) => {
          const isLast = i === side.length - 1 && images.length > MAX_PREVIEW_IMAGES;
          const isFirst = i === 0;
          const isEnd = i === side.length - 1;
          return (
            <button
              key={`${src}-${i + 1}`}
              type="button"
              className={cn(
                "group relative aspect-[16/10] min-h-[118px] overflow-hidden rounded-2xl bg-gray-100 outline-none focus-visible:ring-2 focus-visible:ring-[#004225] focus-visible:ring-offset-2 sm:aspect-[16/9] lg:h-full lg:min-h-0 lg:aspect-auto",
                side.length > 1 && isFirst && "lg:rounded-bl-none lg:rounded-br-none lg:rounded-tl-none lg:rounded-tr-3xl",
                side.length > 1 && isEnd && "lg:rounded-bl-none lg:rounded-br-3xl lg:rounded-tl-none lg:rounded-tr-none",
                side.length === 1 && "lg:rounded-l-none lg:rounded-r-3xl"
              )}
              onClick={() => onImageClick(i + 1)}
            >
              <Image
                src={src}
                alt={localizedText(locale, `Bild ${i + 2}`, `Image ${i + 2}`)}
                fill
                sizes="(max-width: 1024px) 50vw, 380px"
                className={PREVIEW_IMAGE_CLASS}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/10">
                {isLast && (
                  <span className="rounded-full bg-black/55 px-3 py-1.5 text-sm font-semibold text-white shadow-sm sm:text-base">
                    +{images.length - MAX_PREVIEW_IMAGES} {localizedText(locale, "fler", "more")}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RequirementsProfileSection({
  profile,
  loading,
}: {
  profile: RequirementsProfileDTO | null;
  loading: boolean;
}) {
  const { locale } = useI18n();
  if (loading) {
    return (
      <section className="rounded-2xl border border-black/5 bg-white/80 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.05)] sm:rounded-3xl sm:p-6">
        <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          {localizedText(locale, "Kravprofil", "Requirements profile")}
        </h2>
        <p className="mt-3 text-sm text-gray-500">
          {localizedText(locale, "Hämtar kravprofil...", "Loading requirements profile...")}
        </p>
      </section>
    );
  }

  if (!profile) return null;

  const ageRange =
    profile.minAge || profile.maxAge
      ? [
          profile.minAge ? `${localizedText(locale, "Min", "Min")} ${profile.minAge} ${localizedText(locale, "år", "years")}` : null,
          profile.maxAge ? `${localizedText(locale, "Max", "Max")} ${profile.maxAge} ${localizedText(locale, "år", "years")}` : null,
        ]
          .filter(Boolean)
          .join(" / ")
      : null;

  return (
    <section className="rounded-2xl border border-black/5 bg-white/80 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.05)] sm:rounded-3xl sm:p-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-green-900">
          {localizedText(locale, "Ansökningskrav", "Application requirements")}
        </p>
        <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          {profile.title || localizedText(locale, "Kravprofil", "Requirements profile")}
        </h2>
        {ageRange && <p className="text-sm font-medium text-gray-700">{ageRange}</p>}
        {profile.description && (
          <RichTextParagraph
            text={profile.description}
            className="mt-2 max-w-3xl text-sm leading-6 text-gray-700"
          />
        )}
      </div>

      {profile.requiredDocuments?.length ? (
        <div className="mt-5 grid gap-3 min-[520px]:grid-cols-2">
          {profile.requiredDocuments.map((document, index) => (
            <div
              className="min-w-0 rounded-2xl border border-gray-200 bg-white px-4 py-3"
              key={`${document.caption ?? "document"}-${index}`}
            >
              <p className="text-sm font-semibold text-gray-900">
                {document.caption ?? localizedText(locale, "Dokument", "Document")}
              </p>
              <p className="mt-1 break-words text-xs font-medium uppercase tracking-[0.08em] text-gray-500">
                {document.validTypes?.join(", ") || localizedText(locale, "Valfri filtyp", "Any file type")}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const listingId = params?.id;
  const { user } = useAuth();
  const { locale } = useI18n();

  // Per-id increment + demographics guards. These are fire-and-forget,
  // not server state, so they stay as direct service calls inside an
  // effect with a Set-ref guard (same pattern as before).
  const detailedViewIncrementedIds = useRef<Set<string>>(new Set());
  const detailedViewDemographicsRecordedIds = useRef<Set<string>>(new Set());

  // Local UI state — apply form, lightbox.
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);


  const applicationVerificationError = useMemo(
    () => getApplicationVerificationError(user, "listing", locale),
    [locale, user]
  );

  // The listing detail — shared cache. If the user came from the search
  // page card, that page seeded list data but not detail; detail caches
  // its own slot keyed by id.
  const {
    data: listing,
    isLoading: loading,
    isError,
  } = useListing(listingId);
  const error = isError ? "Kunde inte ladda annonsen." : null;

  // Favorites + my-applications: both shared with other pages, so coming
  // from search or sparade hits the cache instead of re-fetching.
  const { data: favoritesData } = useFavorites();
  const favoriteIds = useMemo<Set<string>>(
    () => new Set((favoritesData ?? []).map((f) => f.id)),
    [favoritesData]
  );
  const toggleFavorite = useToggleFavorite();

  const { data: myApplications } = useMyApplications();
  const hasApplied = useMemo(
    () =>
      Boolean(
        listingId &&
          (myApplications ?? []).some((a: any) => a.listingId === listingId)
      ),
    [myApplications, listingId]
  );

  // Requirements profile — only when listing has one.
  const { data: requirementsProfile, isLoading: requirementsLoading } =
    useRequirementsProfile(listing?.requirementsProfileId);

  // Company logo for company-owned listings.
  const companyId =
    listing && listing.ownerType.toLowerCase() === "company"
      ? listing.ownerId
      : null;
  const { data: company } = useQueueCompany(companyId);
  const companyLogoUrl = company?.logoUrl ?? null;

  useEffect(() => {
    if (!listing?.id) return;

    if (!detailedViewIncrementedIds.current.has(listing.id)) {
      detailedViewIncrementedIds.current.add(listing.id);
      listingService
        .incrementViews(listing.id, "DETAILED")
        .catch((err) =>
          console.error("Failed to increment detailed view:", err)
        );
    }

    if (
      canRecordDemographicsForUser(user) &&
      !detailedViewDemographicsRecordedIds.current.has(listing.id)
    ) {
      detailedViewDemographicsRecordedIds.current.add(listing.id);
      demographicsService
        .recordListingViewWithCompanyScope(companyId, listing.id, {
          deviceType: getClientDeviceType(),
          viewType: "DETAILED",
          resultedInLike: favoriteIds.has(listing.id),
        })
        .catch(ignoreDemographicsRecordError);
    }
  }, [companyId, favoriteIds, listing?.id, user]);

  // Nearby listings — preserves the same two-step fetch fallback the old
  // code had (try city-filtered, then fall back to unfiltered if too few).
  // Wrapped in a single useQuery so the whole "nearby" view caches under
  // one key. Disabled until we have a listing.
  const nearbyQuery = useQuery<ListingCardDTO[]>({
    queryKey: qk.listings.nearby(
      listing?.id ?? null,
      listing?.city || listing?.area || null,
      NEARBY_LISTINGS_FETCH_SIZE
    ),
    enabled: Boolean(listing),
    staleTime: 60_000,
    queryFn: async () => {
      if (!listing) return [];

      const location = listing.city || listing.area || null;
      const nearbyResponse = await listingService.getAll(
        {
          page: 0,
          size: NEARBY_LISTINGS_FETCH_SIZE,
          city: location,
          seed: listing.id,
        }
      );

      const byId = new Map<string, ListingCardDTO>();
      const addCandidates = (items: ListingCardDTO[] = []) => {
        items.forEach((item) => {
          if (item.id !== listing.id && !byId.has(item.id)) {
            byId.set(item.id, item);
          }
        });
      };

      addCandidates(nearbyResponse.content);

      if (byId.size < NEARBY_LISTINGS_PAGE_SIZE) {
        const fallbackResponse = await listingService.getAll(
          {
            page: 0,
            size: NEARBY_LISTINGS_FETCH_SIZE,
            seed: listing.id,
          }
        );
        addCandidates(fallbackResponse.content);
      }

      return Array.from(byId.values());
    },
  });
  const nearbyListings = nearbyQuery.data ?? [];
  const nearbyLoading = nearbyQuery.isLoading;
  const nearbyError = nearbyQuery.isError ? localizedText(locale, "Kunde inte ladda fler bostäder.", "Could not load more homes.") : null;

  // Client-side pagination over the full nearby set (pulled in one query).
  // Reset to page 1 whenever the underlying listing or its location changes.
  const [nearbyListingsPage, setNearbyListingsPage] = useState(1);
  const nearbyTotalPages = useMemo(
    () =>
      Math.max(
        1,
        Math.ceil(nearbyListings.length / NEARBY_LISTINGS_PAGE_SIZE),
      ),
    [nearbyListings.length],
  );
  const nearbyCurrentPage = Math.min(
    Math.max(1, nearbyListingsPage),
    nearbyTotalPages,
  );
  const nearbyPageListings = useMemo(() => {
    const start = (nearbyCurrentPage - 1) * NEARBY_LISTINGS_PAGE_SIZE;
    return nearbyListings.slice(start, start + NEARBY_LISTINGS_PAGE_SIZE);
  }, [nearbyCurrentPage, nearbyListings]);

  useEffect(() => {
    setNearbyListingsPage(1);
  }, [listing?.id]);

  useEffect(() => {
    if (nearbyListingsPage > nearbyTotalPages) {
      setNearbyListingsPage(nearbyTotalPages);
    }
  }, [nearbyListingsPage, nearbyTotalPages]);

  const handleNearbyPageChange = useCallback((nextPage: number) => {
    setNearbyListingsPage(nextPage);
    if (typeof document !== "undefined") {
      document
        .getElementById("nearby-listings")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Apply mutation: invalidates myApplications on settle so hasApplied
  // flips true automatically when the cache re-syncs.
  const applyMutation = useApplyToListing();

  const handleFavoriteToggle = useCallback(
    async (id: string, isFav: boolean) => {
      if (!user) {
        alert(localizedText(locale, "Du måste vara inloggad för att spara bostäder", "You must be signed in to save homes"));
        return;
      }

      // Optimistic patch + rollback live inside useToggleFavorite. We keep
      // the demographics side effect here — it's fire-and-forget.
      toggleFavorite.mutate({ listingId: id, nextIsFavorite: isFav });

      if (isFav && canRecordDemographicsForUser(user)) {
        demographicsService
          .recordListingViewWithCompanyScope(companyId, id, {
            deviceType: getClientDeviceType(),
            viewType: "DETAILED",
            resultedInLike: true,
          })
          .catch(ignoreDemographicsRecordError);
      }
    },
    [companyId, user, toggleFavorite, locale]
  );

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  // Fire-and-forget: increment view count + record demographics, once per
  // listing per session. Same Set-ref guard as before.
  const handleApply = useCallback(() => {
    if (!listingId || !listing) return;
    if (!user) {
      setApplyError(localizedText(locale, "Du måste vara inloggad för att skicka intresse.", "You must be signed in to send interest."));
      return;
    }

    if (applicationVerificationError) {
      setApplyError(applicationVerificationError);
      return;
    }

    setApplyError(null);
    setApplySuccess(null);

    const isCompany = listing.ownerType.toLowerCase() === "company";
    applyMutation.mutate(
      { listingId, message: localizedText(locale, "Hej! Jag är intresserad.", "Hi! I am interested."), isPrivate: !isCompany },
      {
        onSuccess: () => setApplySuccess(localizedText(locale, "Ansökan skickad!", "Application sent!")),
        onError: (err: any) =>
          setApplyError(err?.message ?? localizedText(locale, "Kunde inte skicka ansökan.", "Could not send application.")),
      }
    );
  }, [
    applicationVerificationError,
    applyMutation,
    listingId,
    listing,
    user,
    locale
  ]);
  const applying = applyMutation.isPending;

  const galleryImages = useMemo(() => listing?.imageUrls || [], [listing]);

  const advertiser: (AdvertiserSummary & { companyPageUrl?: string }) | null = useMemo(() => {
    if (!listing) return null;
    const isCompany = listing.ownerType.toLowerCase() === "company";
    return {
      id: listing.ownerId,
      type: isCompany ? "company" : "private_landlord",
      displayName: listing.ownerName,
      logoUrl: companyLogoUrl || listing.ownerLogoUrl || null,
      bannerUrl: null,
      city: null,
      rating: null,
      website: null,
      description: null,
      phone: null,
      contactEmail: null,
      contactPhone: null,
      contactNote: listing.provider
        ? `${localizedText(locale, "Förmedlas via", "Managed through")} ${listing.provider}`
        : null,
      subtitle: isCompany
        ? localizedText(locale, "Företag", "Company")
        : localizedText(locale, "Bostadsaktör", "Housing provider"),
      companyPageUrl: isCompany ? `/all-queues/${listing.ownerId}` : undefined,
    };
  }, [companyLogoUrl, listing, locale]);

  const mapListings = useMemo<ListingCardDTO[]>(() => {
    if (!listing) return [];
    return [{
      id: listing.id,
      title: listing.title,
      imageUrl: listing.imageUrls?.[0] || "",
      location: `${listing.area}, ${listing.city}`,
      rent: listing.rent,
      dwellingType: listing.dwellingType,
      rooms: listing.rooms,
      sizeM2: listing.sizeM2 || 0,
      tags: listing.tags,
      hostType: listing.ownerType,
      verifiedHost: listing.verifiedOwner,
      lat: listing.lat,
      lng: listing.lng,
    }];
  }, [listing]);

  if (loading) {
    return (
      <main className={DETAIL_PAGE_CONTAINER_CLASS}>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-12 text-center text-gray-500">
          {localizedText(locale, "Laddar annons...", "Loading listing...")}
        </div>
      </main>
    );
  }

  if (error || !listing || !advertiser) {
    return (
      <main className={DETAIL_PAGE_CONTAINER_CLASS}>
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center text-red-800">
          {error ?? localizedText(locale, "Annonsen kunde inte hittas.", "The listing could not be found.")}
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Lightbox — rendered outside the scroll container, no z-index conflicts */}
      {lightboxOpen && (
        <Lightbox
          images={galleryImages}
          startIndex={lightboxIndex}
          onClose={closeLightbox}
        />
      )}

      <main className={DETAIL_PAGE_CONTAINER_CLASS}>
        <div className="flex w-full flex-col gap-6 sm:gap-8 lg:gap-10">

          {/* Feedback messages */}
          {applySuccess && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {applySuccess}
            </div>
          )}
          {applyError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {applyError}
            </div>
          )}
          {applicationVerificationError && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {applicationVerificationError}
            </div>
          )}

          {/* 1. Top image preview grid */}
          <ImagePreviewGrid images={galleryImages} onImageClick={openLightbox} />

          {/* 2. About / listing info */}
          <BostadAbout
            listing={listing}
            isFavorite={favoriteIds.has(listing.id)}
            onFavoriteToggle={handleFavoriteToggle}
            onApplyClick={handleApply}
            applyDisabled={applying || hasApplied || Boolean(applicationVerificationError)}
            hasApplied={hasApplied}
          />

          <RequirementsProfileSection
            profile={requirementsProfile ?? null}
            loading={requirementsLoading}
          />

          {/* 3. Map — own dedicated section */}
          <section className="w-full">
            <div className="h-[300px] w-full overflow-hidden rounded-2xl border border-black/5 shadow-[0_18px_45px_rgba(0,0,0,0.05)] sm:h-[360px] sm:rounded-3xl lg:h-[420px]">
              <ListingsMap
                listings={mapListings}
                className="h-full w-full"
                fillContainer
                showPopups={false}
              />
            </div>
          </section>

          {/* 4. Provider info */}
          <BostadLandlord advertiser={advertiser} />

          {/* 5. Full image slideshow */}
          {galleryImages.length > 0 && (
            <div className="border-t border-gray-100 pt-5 sm:pt-6">
              <ImageSlideshow images={galleryImages} title={listing.title} />
            </div>
          )}

          {/* 6. Nearby listings */}
          <section id="nearby-listings" className="scroll-mt-24 border-t border-gray-100 pt-6 sm:pt-8">
            {!nearbyLoading && !nearbyError && nearbyPageListings.length > 0 ? (
              <QueueListings
                listings={nearbyPageListings}
                title={localizedText(locale, "Fler bostäder i närheten", "More homes nearby")}
                page={nearbyCurrentPage}
                totalPages={nearbyTotalPages}
                onPageChange={handleNearbyPageChange}
              />
            ) : (
              <>
                <h2 className="mb-5 text-xl font-bold tracking-tight text-gray-900 sm:mb-6 sm:text-2xl">
                  {localizedText(locale, "Fler bostäder i närheten", "More homes nearby")}
                </h2>

                <div
                  className={`rounded-xl border border-dashed px-4 py-8 text-center sm:p-10 ${
                    nearbyError
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-gray-300 bg-gray-50 text-gray-500"
                  }`}
                >
                  {nearbyLoading
                    ? localizedText(locale, "Hämtar fler bostäder...", "Loading more homes...")
                    : nearbyError
                    ? nearbyError
                    : localizedText(locale, "Inga fler bostäder hittades just nu.", "No more homes were found right now.")}
                </div>
              </>
            )}
          </section>

        </div>
      </main>
    </>
  );
}
