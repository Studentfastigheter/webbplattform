"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getApplicationVerificationError } from "@/lib/application-eligibility";
import { cn } from "@/lib/utils";

import BostadAbout from "@/features/ads/components/BostadAbout";
import BostadLandlord from "@/features/ads/components/BostadLandlord";
import ImageSlideshow from "@/features/ads/components/ImageSlideshow";

import { listingService } from "@/features/listings/services/listing-service";
import { queueService } from "@/features/queues/services/queue-service";
import {
  demographicsService,
  getClientDeviceType,
} from "@/features/analytics/services/demographics-service";
import {
  ListingDetailDTO,
  ListingCardDTO,
  RequirementsProfileDTO,
} from "@/types/listing";
import { AdvertiserSummary } from "@/types";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

const ListingsMap = dynamic(() => import("@/components/shared/map/ListingsMap"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[400px] w-full rounded-3xl bg-gray-100 animate-pulse" aria-hidden />
  ),
});

import ListingCardSmall from "@/features/listings/components/ListingCard_Small";

const NEARBY_LISTINGS_LIMIT = 8;
const NEARBY_LISTINGS_FETCH_SIZE = NEARBY_LISTINGS_LIMIT + 1;

const splitListingLocation = (location: string | null | undefined, fallback: string) => {
  const [area, ...cityParts] = (location ?? "").split(",");
  const trimmedArea = area?.trim();
  const trimmedCity = cityParts.join(",").trim();

  return {
    area: trimmedArea || fallback,
    city: trimmedCity || trimmedArea || fallback,
  };
};

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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
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
          className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
          onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + images.length) % images.length); }}
          aria-label={localizedText(locale, "Föregående bild", "Previous image")}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Image */}
      <div className="max-h-[85vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[current]}
          alt={localizedText(locale, `Bild ${current + 1}`, `Image ${current + 1}`)}
          className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
        />
      </div>

      {/* Next */}
      {images.length > 1 && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
          onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % images.length); }}
          aria-label={localizedText(locale, "Nästa bild", "Next image")}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] px-2 pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`shrink-0 h-14 w-20 overflow-hidden rounded-lg border-2 transition ${
                i === current ? "border-white opacity-100" : "border-transparent opacity-50 hover:opacity-75"
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Top 5-image preview grid ────────────────────────────────────────────────
function ImagePreviewGrid({
  images,
  onImageClick,
}: {
  images: string[];
  onImageClick: (index: number) => void;
}) {
  const { locale } = useI18n();
  if (images.length === 0) return null;

  const shown = images.slice(0, 5);

  if (shown.length === 1) {
    return (
      <button
        className="relative w-full h-[420px] overflow-hidden rounded-2xl"
        onClick={() => onImageClick(0)}
      >
        <img src={shown[0]} alt={localizedText(locale, "Bild 1", "Image 1")} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition" />
      </button>
    );
  }

  if (shown.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-1.5 h-[420px]">
        {shown.map((src, i) => (
          <button
            key={i}
            className={cn(
              "relative overflow-hidden",
              i === 0 ? "rounded-l-2xl" : "rounded-r-2xl"
            )}
            onClick={() => onImageClick(i)}
          >
            <img src={src} alt={localizedText(locale, `Bild ${i + 1}`, `Image ${i + 1}`)} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition" />
          </button>
        ))}
      </div>
    );
  }

  // 3–5 images: main left + side thumbnails
  const side = shown.slice(1);
  return (
    <div className="grid grid-cols-[1fr_0.5fr] gap-1.5 h-[460px]">
      {/* Main image */}
      <button
        className="relative row-span-full overflow-hidden rounded-l-2xl"
        onClick={() => onImageClick(0)}
      >
        <img src={shown[0]} alt={localizedText(locale, "Bild 1", "Image 1")} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition" />
      </button>

      {/* Side thumbnails — evenly split the full height */}
      <div className="grid grid-rows-subgrid row-span-full" style={{ gridTemplateRows: `repeat(${side.length}, 1fr)`, gap: "6px" }}>
        {side.map((src, i) => {
          const isLast = i === side.length - 1 && images.length > 5;
          const isFirst = i === 0;
          const isEnd = i === side.length - 1;
          return (
            <button
              key={i + 1}
              className={cn(
                "relative overflow-hidden",
                isFirst && "rounded-tr-2xl",
                isEnd && "rounded-br-2xl"
              )}
              onClick={() => onImageClick(i + 1)}
            >
              <img src={src} alt={localizedText(locale, `Bild ${i + 2}`, `Image ${i + 2}`)} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition flex items-center justify-center">
                {isLast && (
                  <span className="text-white font-semibold text-lg drop-shadow-lg bg-black/40 px-3 py-1 rounded-lg">
                    +{images.length - 5} {localizedText(locale, "fler", "more")}
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
      <section className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
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
    <section className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-green-900">
          {localizedText(locale, "Ansökningskrav", "Application requirements")}
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          {profile.title || localizedText(locale, "Kravprofil", "Requirements profile")}
        </h2>
        {ageRange && <p className="text-sm font-medium text-gray-700">{ageRange}</p>}
        {profile.description && (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-700">
            {profile.description}
          </p>
        )}
      </div>

      {profile.requiredDocuments?.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {profile.requiredDocuments.map((document, index) => (
            <div
              className="rounded-2xl border border-gray-200 bg-white px-4 py-3"
              key={`${document.caption ?? "document"}-${index}`}
            >
              <p className="text-sm font-semibold text-gray-900">
                {document.caption ?? localizedText(locale, "Dokument", "Document")}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.08em] text-gray-500">
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
  const router = useRouter();
  const { user } = useAuth();
  const { locale, localizedHref } = useI18n();

  const [listing, setListing] = useState<ListingDetailDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [requirementsProfile, setRequirementsProfile] =
    useState<RequirementsProfileDTO | null>(null);
  const [requirementsLoading, setRequirementsLoading] = useState(false);
  const detailedViewIncrementedIds = useRef<Set<string>>(new Set());
  const detailedViewDemographicsRecordedIds = useRef<Set<string>>(new Set());

  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [nearbyListings, setNearbyListings] = useState<ListingCardDTO[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);
  const applicationVerificationError = useMemo(
    () => getApplicationVerificationError(user, "listing", locale),
    [locale, user]
  );

  // Ladda favoriter och kolla om redan ansökt
  useEffect(() => {
    if (user) {
      listingService.getFavorites().then(favs => {
        setFavoriteIds(new Set(favs.map(f => f.id)));
      }).catch(console.error);

      if (listingId) {
        listingService.getMyApplications().then(apps => {
          setHasApplied(apps.some(a => a.listingId === listingId));
        }).catch(console.error);
      }
    } else {
      setFavoriteIds(new Set());
      setHasApplied(false);
    }
  }, [user, listingId]);

  const handleFavoriteToggle = useCallback(async (id: string, isFav: boolean) => {
    if (!user) {
      alert(localizedText(locale, "Du måste vara inloggad för att spara bostäder", "You must be signed in to save homes"));
      return;
    }
    
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (isFav) next.add(id);
      else next.delete(id);
      return next;
    });

    const action = isFav
      ? listingService.addFavorite(id).then(() =>
          demographicsService
            .recordListingView(id, {
              deviceType: getClientDeviceType(),
              viewType: "DETAILED",
              resultedInLike: true,
            })
            .catch((err) =>
              console.error("Failed to record favorite demographics:", err)
            )
        )
      : listingService.removeFavorite(id);

    return action.catch(err => {
      console.error("Failed to toggle favorite:", err);
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (isFav) next.delete(id);
        else next.add(id);
        return next;
      });
    });
  }, [locale, user]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  useEffect(() => {
    let active = true;
    if (!listingId) return;

    setLoading(true);
    setError(null);

    listingService
      .get(listingId)
      .then((res) => { if (active) setListing(res); })
      .catch((err: any) => {
        if (!active) return;
        console.error("Fetch error:", err);
        setError(localizedText(locale, "Kunde inte ladda annonsen.", "Could not load the listing."));
        setListing(null);
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [listingId, locale]);

  useEffect(() => {
    if (!listing?.id) {
      return;
    }

    if (!detailedViewIncrementedIds.current.has(listing.id)) {
      detailedViewIncrementedIds.current.add(listing.id);
      listingService
        .incrementViews(listing.id, "DETAILED")
        .catch((err) => console.error("Failed to increment detailed view:", err));
    }

    if (user && !detailedViewDemographicsRecordedIds.current.has(listing.id)) {
      detailedViewDemographicsRecordedIds.current.add(listing.id);
      demographicsService
        .recordListingView(listing.id, {
          deviceType: getClientDeviceType(),
          viewType: "DETAILED",
          resultedInLike: favoriteIds.has(listing.id),
        })
        .catch((err) =>
          console.error("Failed to record detailed-view demographics:", err)
        );
    }
  }, [favoriteIds, listing?.id, user]);

  useEffect(() => {
    if (!listing?.requirementsProfileId) {
      setRequirementsProfile(null);
      setRequirementsLoading(false);
      return;
    }

    let active = true;
    setRequirementsLoading(true);

    listingService
      .getRequirementsProfile(listing.requirementsProfileId)
      .then((profile) => {
        if (active) setRequirementsProfile(profile);
      })
      .catch(() => {
        if (active) setRequirementsProfile(null);
      })
      .finally(() => {
        if (active) setRequirementsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [listing?.requirementsProfileId]);

  useEffect(() => {
    if (!listing) {
      setNearbyListings([]);
      setNearbyError(null);
      setNearbyLoading(false);
      return;
    }

    let active = true;

    const loadNearbyListings = async () => {
      setNearbyLoading(true);
      setNearbyError(null);
      setNearbyListings([]);

      try {
        const location = listing.city || listing.area || null;
        const nearbyResponse = await listingService.getAll(
          0,
          NEARBY_LISTINGS_FETCH_SIZE,
          location
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

        if (byId.size < NEARBY_LISTINGS_LIMIT) {
          const fallbackResponse = await listingService.getAll(
            0,
            NEARBY_LISTINGS_LIMIT * 3
          );
          addCandidates(fallbackResponse.content);
        }

        if (active) {
          setNearbyListings(
            Array.from(byId.values()).slice(0, NEARBY_LISTINGS_LIMIT)
          );
        }
      } catch (err) {
        console.error("Failed to load nearby listings:", err);
        if (active) {
          setNearbyError(localizedText(locale, "Kunde inte ladda fler bostäder.", "Could not load more homes."));
          setNearbyListings([]);
        }
      } finally {
        if (active) {
          setNearbyLoading(false);
        }
      }
    };

    loadNearbyListings();

    return () => { active = false; };
  }, [listing, locale]);

  // Hämta företagets logga om det är en företagsannons
  useEffect(() => {
    if (!listing) return;
    if (listing.ownerType.toLowerCase() !== "company") return;
    if (!listing.ownerId) return;

    let active = true;
    queueService.getCompany(listing.ownerId)
      .then((company) => {
        if (active && company.logoUrl) {
          setCompanyLogoUrl(company.logoUrl);
        }
      })
      .catch(() => { /* ignorera */ });

    return () => { active = false; };
  }, [listing]);

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

    setApplying(true);
    setApplyError(null);
    setApplySuccess(null);

    const message = localizedText(locale, "Hej! Jag är intresserad.", "Hi! I am interested.");
    const action =
      listing.ownerType.toLowerCase() === "company"
        ? listingService.applyToListing(listingId, message)
        : listingService.applyToPrivateListing(listingId, message);

    action
      .then(() => {
        setApplySuccess(localizedText(locale, "Ansökan skickad!", "Application sent!"));
        setHasApplied(true);
      })
      .catch((err: any) =>
        setApplyError(
          err?.message ??
            localizedText(locale, "Kunde inte skicka ansökan.", "Could not send application."),
        ),
      )
      .finally(() => setApplying(false));
  }, [applicationVerificationError, listingId, listing, locale, user]);

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
        : localizedText(locale, "Privat hyresvärd", "Private landlord"),
      companyPageUrl: isCompany ? `/alla-koer/${listing.ownerId}` : undefined,
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
      <main className="container mx-auto px-4 pb-12 pt-6 lg:pt-10 max-w-6xl">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-12 text-center text-gray-500">
          {localizedText(locale, "Laddar annons...", "Loading listing...")}
        </div>
      </main>
    );
  }

  if (error || !listing || !advertiser) {
    return (
      <main className="container mx-auto px-4 pb-12 pt-6 lg:pt-10 max-w-6xl">
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

      <main className="container mx-auto px-4 pb-12 pt-6 lg:pt-10 max-w-6xl">
        <div className="flex w-full flex-col gap-10">

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
            profile={requirementsProfile}
            loading={requirementsLoading}
          />

          {/* 3. Map — own dedicated section */}
          <section className="w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-5 tracking-tight">
              {localizedText(locale, "Karta", "Map")}
            </h2>
            <div className="w-full h-[400px] rounded-3xl overflow-hidden border border-black/5 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
              <ListingsMap
                listings={mapListings}
                className="h-full w-full"
                fillContainer
                showPopups={false}
              />
            </div>
          </section>

          {/* 4. Landlord info */}
          <BostadLandlord advertiser={advertiser} />

          {/* 5. Full image slideshow */}
          {galleryImages.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <ImageSlideshow images={galleryImages} title={listing.title} />
            </div>
          )}

          {/* 6. Nearby listings */}
          <section className="pt-8 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">
              {localizedText(locale, "Fler bostäder i närheten", "More homes nearby")}
            </h2>
            <div className="relative group mx-auto">
              <button
                onClick={() => {
                  const el = document.getElementById("nearby-slider");
                  if (el) el.scrollBy({ left: -320, behavior: "smooth" });
                }}
                className="absolute left-0 top-[40%] -translate-y-1/2 -ml-5 z-10 flex items-center justify-center h-12 w-12 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-md opacity-0 group-hover:opacity-100 hidden md:flex"
                aria-label={localizedText(locale, "Scrolla vänster", "Scroll left")}
              >
                <ChevronLeft className="h-6 w-6 text-gray-600" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById("nearby-slider");
                  if (el) el.scrollBy({ left: 320, behavior: "smooth" });
                }}
                className="absolute right-0 top-[40%] -translate-y-1/2 -mr-5 z-10 flex items-center justify-center h-12 w-12 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-md opacity-0 group-hover:opacity-100 hidden md:flex"
                aria-label={localizedText(locale, "Scrolla höger", "Scroll right")}
              >
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </button>

              <div
                id="nearby-slider"
                className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory px-1"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {nearbyLoading && (
                  <div className="w-full py-8 text-sm text-gray-500">
                    {localizedText(locale, "Hämtar fler bostäder...", "Loading more homes...")}
                  </div>
                )}

                {!nearbyLoading && nearbyError && (
                  <div className="w-full py-8 text-sm text-red-700">
                    {nearbyError}
                  </div>
                )}

                {!nearbyLoading && !nearbyError && nearbyListings.length === 0 && (
                  <div className="w-full py-8 text-sm text-gray-500">
                    {localizedText(locale, "Inga fler bostäder hittades just nu.", "No more homes were found right now.")}
                  </div>
                )}

                {!nearbyLoading && !nearbyError && nearbyListings.map((nearby) => {
                  const { area, city } = splitListingLocation(
                    nearby.location,
                    localizedText(locale, "Ej angivet", "Not specified"),
                  );

                  return (
                    <div
                      key={nearby.id}
                      className="w-[380px] max-w-[calc(100vw-2rem)] shrink-0 snap-start"
                    >
                      <ListingCardSmall
                        id={nearby.id}
                        title={nearby.title}
                        area={area}
                        city={city}
                        dwellingType={nearby.dwellingType || localizedText(locale, "Bostad", "Home")}
                        rooms={nearby.rooms || 0}
                        sizeM2={nearby.sizeM2 || 0}
                        rent={nearby.rent || 0}
                        landlordType={nearby.hostType}
                        hostName={nearby.hostName}
                        hostLogoUrl={nearby.hostLogoUrl}
                        isVerified={nearby.verifiedHost}
                        isFavorite={favoriteIds.has(nearby.id)}
                        onFavoriteToggle={handleFavoriteToggle}
                        imageUrl={nearby.imageUrl}
                        tags={nearby.tags}
                        onClick={() => router.push(localizedHref(`/bostader/${nearby.id}`))}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}
