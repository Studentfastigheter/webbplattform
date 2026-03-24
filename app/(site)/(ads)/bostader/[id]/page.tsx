"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

import BostadAbout from "@/components/ads/BostadAbout";
import BostadLandlord from "@/components/ads/BostadLandlord";

import { listingService } from "@/services/listing-service";
import { ListingDetailDTO, ListingCardDTO } from "@/types/listing";
import { AdvertiserSummary } from "@/types";

const ListingsMap = dynamic(() => import("@/components/Map/ListingsMap"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[400px] w-full rounded-3xl bg-gray-100 animate-pulse" aria-hidden />
  ),
});

import ListingCardSmall from "@/components/Listings/ListingCard_Small";

const DUMMY_NEARBY_LISTINGS: ListingCardDTO[] = [
  {
    id: "nearby-1",
    title: "Pennygången 12",
    city: "Göteborg",
    area: "Göteborg, Sverige",
    rent: 4100,
    dwellingType: "apartment",
    rooms: 1,
    sizeM2: 24,
    description: "",
    tags: ["Möblerat", "Balkong"],
    imageUrls: ["https://image-cdn.mild.cloud/sgs.se/wp-content/uploads/2025/06/4X3A7575sgs_fotolisaforsell.jpg?height=683&aspect_ratio=1024:683&quality=80"],
    imageUrl: "https://image-cdn.mild.cloud/sgs.se/wp-content/uploads/2025/06/4X3A7575sgs_fotolisaforsell.jpg?height=683&aspect_ratio=1024:683&quality=80",
    hostType: "företag",
    verifiedHost: true,
    ownerType: "company",
    ownerName: "Campuslyan",
    ownerId: 1,
    verifiedOwner: true
  } as unknown as ListingCardDTO,
  {
    id: "nearby-2",
    title: "Pennygången 14",
    city: "Göteborg",
    area: "Göteborg, Sverige",
    rent: 4600,
    dwellingType: "apartment",
    rooms: 2,
    sizeM2: 45,
    description: "",
    tags: ["Student"],
    imageUrls: ["https://image-cdn.mild.cloud/sgs.se/wp-content/uploads/2025/06/4X3A7568sgs_fotolisaforsell.jpg?height=683&aspect_ratio=1024:683&quality=80"],
    imageUrl: "https://image-cdn.mild.cloud/sgs.se/wp-content/uploads/2025/06/4X3A7568sgs_fotolisaforsell.jpg?height=683&aspect_ratio=1024:683&quality=80",
    hostType: "företag",
    verifiedHost: true,
    ownerType: "company",
    ownerName: "Campuslyan",
    ownerId: 1,
    verifiedOwner: true
  } as unknown as ListingCardDTO,
  {
    id: "nearby-3",
    title: "Pennygången 2",
    city: "Göteborg",
    area: "Göteborg, Sverige",
    rent: 3900,
    dwellingType: "apartment",
    rooms: 1,
    sizeM2: 20,
    description: "",
    tags: ["Poängfri"],
    imageUrls: ["https://image-cdn.mild.cloud/sgs.se/wp-content/uploads/2025/06/4X3A7575sgs_fotolisaforsell.jpg?height=683&aspect_ratio=1024:683&quality=80"],
    imageUrl: "https://image-cdn.mild.cloud/sgs.se/wp-content/uploads/2025/06/4X3A7575sgs_fotolisaforsell.jpg?height=683&aspect_ratio=1024:683&quality=80",
    hostType: "företag",
    verifiedHost: true,
    ownerType: "company",
    ownerName: "Campuslyan",
    ownerId: 1,
    verifiedOwner: true
  } as unknown as ListingCardDTO
];

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
        aria-label="Stäng"
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
          aria-label="Föregående bild"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Image */}
      <div className="max-h-[85vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[current]}
          alt={`Bild ${current + 1}`}
          className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
        />
      </div>

      {/* Next */}
      {images.length > 1 && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
          onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % images.length); }}
          aria-label="Nästa bild"
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
  if (images.length === 0) return null;

  const shown = images.slice(0, 5);

  if (shown.length === 1) {
    return (
      <button
        className="relative w-full h-[420px] overflow-hidden rounded-2xl"
        onClick={() => onImageClick(0)}
      >
        <img src={shown[0]} alt="Bild 1" className="absolute inset-0 h-full w-full object-cover" />
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
            <img src={src} alt={`Bild ${i + 1}`} className="absolute inset-0 h-full w-full object-cover" />
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
        <img src={shown[0]} alt="Bild 1" className="absolute inset-0 h-full w-full object-cover" />
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
              <img src={src} alt={`Bild ${i + 2}`} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition flex items-center justify-center">
                {isLast && (
                  <span className="text-white font-semibold text-lg drop-shadow-lg bg-black/40 px-3 py-1 rounded-lg">
                    +{images.length - 5} fler
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

// ─── Full image slideshow ─────────────────────────────────────────────────────
function ImageSlideshow({ images, title }: { images: string[]; title: string }) {
  const [current, setCurrent] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  if (images.length === 0) return null;

  const scrollTo = (index: number) => {
    setCurrent(index);
    const el = sliderRef.current;
    if (el) {
      const child = el.children[index] as HTMLElement;
      if (child) child.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  };

  return (
    <section className="w-full">
      <h2 className="text-2xl font-bold text-gray-900 mb-5 tracking-tight">Alla bilder</h2>

      {/* Main display */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-gray-100 aspect-video mb-3">
        <img
          src={images[current]}
          alt={`${title} – bild ${current + 1}`}
          className="h-full w-full object-cover transition-all duration-300"
        />
        <span className="absolute bottom-4 right-4 bg-black/50 text-white text-sm font-medium px-3 py-1 rounded-full">
          {current + 1} / {images.length}
        </span>
        {images.length > 1 && (
          <>
            <button
              onClick={() => scrollTo((current - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 hover:bg-white shadow transition"
              aria-label="Föregående"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={() => scrollTo((current + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 hover:bg-white shadow transition"
              aria-label="Nästa"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          ref={sliderRef}
          className="flex gap-2 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`shrink-0 h-20 w-28 overflow-hidden rounded-xl border-2 transition ${
                i === current
                  ? "border-gray-900 opacity-100"
                  : "border-transparent opacity-60 hover:opacity-90"
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const listingId = params?.id;
  const router = useRouter();
  const { user } = useAuth();

  const [listing, setListing] = useState<ListingDetailDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // Ladda favoriter om inloggad
  useEffect(() => {
    if (user) {
      listingService.getFavorites().then(favs => {
        setFavoriteIds(new Set(favs.map(f => f.id)));
      }).catch(console.error);
    } else {
      setFavoriteIds(new Set());
    }
  }, [user]);

  const handleFavoriteToggle = useCallback((id: string, isFav: boolean) => {
    if (!user) {
      alert("Du måste vara inloggad för att spara bostäder");
      return;
    }
    
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (isFav) next.add(id);
      else next.delete(id);
      return next;
    });

    const action = isFav ? listingService.addFavorite(id) : listingService.removeFavorite(id);
    action.catch(err => {
      console.error("Failed to toggle favorite:", err);
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (isFav) next.delete(id);
        else next.add(id);
        return next;
      });
    });
  }, [user]);

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
        setError("Kunde inte ladda annonsen.");
        setListing(null);
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [listingId]);

  const handleApply = useCallback(() => {
    if (!listingId || !listing) return;
    if (!user) {
      setApplyError("Du måste vara inloggad för att skicka intresse.");
      return;
    }

    setApplying(true);
    setApplyError(null);
    setApplySuccess(null);

    const action =
      listing.ownerType.toLowerCase() === "company" || listing.ownerType === "Företag"
        ? listingService.registerInterest(listingId)
        : listingService.apply(listingId, "Hej! Jag är intresserad.");

    action
      .then(() => setApplySuccess("Intresseanmälan skickad!"))
      .catch((err: any) => setApplyError(err?.message ?? "Kunde inte skicka intresse."))
      .finally(() => setApplying(false));
  }, [listingId, listing, user]);

  const galleryImages = useMemo(() => listing?.imageUrls || [], [listing]);

  const advertiser: AdvertiserSummary | null = useMemo(() => {
    if (!listing) return null;
    return {
      id: listing.ownerId,
      type: listing.ownerType.toLowerCase() === "company" ? "company" : "private_landlord",
      displayName: listing.ownerName,
      logoUrl: listing.ownerLogoUrl || null,
      bannerUrl: null,
      city: null,
      rating: null,
      website: null,
      description: null,
      phone: null,
      contactEmail: null,
      contactPhone: null,
      contactNote: listing.provider ? `Förmedlas via ${listing.provider}` : null,
      subtitle: listing.ownerType.toLowerCase() === "company" ? "Företag" : "Privat hyresvärd",
    };
  }, [listing]);

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
          Laddar annons...
        </div>
      </main>
    );
  }

  if (error || !listing || !advertiser) {
    return (
      <main className="container mx-auto px-4 pb-12 pt-6 lg:pt-10 max-w-6xl">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center text-red-800">
          {error ?? "Annonsen kunde inte hittas."}
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

          {/* 1. Top image preview grid */}
          <ImagePreviewGrid images={galleryImages} onImageClick={openLightbox} />

          {/* 2. About / listing info */}
          <BostadAbout
            listing={listing}
            isFavorite={favoriteIds.has(listing.id)}
            onApplyClick={handleApply}
            applyDisabled={applying}
          />

          {/* 3. Map — own dedicated section */}
          <section className="w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-5 tracking-tight">Karta</h2>
            <div className="w-full h-[400px] rounded-3xl overflow-hidden border border-black/5 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
              <ListingsMap listings={mapListings} className="h-full w-full" />
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
              Fler bostäder i närheten
            </h2>
            <div className="relative group mx-auto">
              <button
                onClick={() => {
                  const el = document.getElementById("nearby-slider");
                  if (el) el.scrollBy({ left: -320, behavior: "smooth" });
                }}
                className="absolute left-0 top-[40%] -translate-y-1/2 -ml-5 z-10 flex items-center justify-center h-12 w-12 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-md opacity-0 group-hover:opacity-100 hidden md:flex"
                aria-label="Scrolla vänster"
              >
                <ChevronLeft className="h-6 w-6 text-gray-600" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById("nearby-slider");
                  if (el) el.scrollBy({ left: 320, behavior: "smooth" });
                }}
                className="absolute right-0 top-[40%] -translate-y-1/2 -mr-5 z-10 flex items-center justify-center h-12 w-12 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-md opacity-0 group-hover:opacity-100 hidden md:flex"
                aria-label="Scrolla höger"
              >
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </button>

              <div
                id="nearby-slider"
                className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory px-1"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {DUMMY_NEARBY_LISTINGS.map((nearby) => (
                  <div key={nearby.id} className="snap-start shrink-0">
                    <ListingCardSmall
                      title={nearby.title}
                      area={(nearby as any).area}
                      city={(nearby as any).city}
                      dwellingType={nearby.dwellingType}
                      rooms={nearby.rooms}
                      sizeM2={nearby.sizeM2 || 0}
                      rent={nearby.rent}
                      landlordType={nearby.hostType}
                      hostName={(nearby as any).ownerName}
                      hostLogoUrl={(nearby as any).ownerLogoUrl ?? undefined}
                      // isVerified={(nearby as any).verifiedOwner}
                      isFavorite={favoriteIds.has(nearby.id)}
                      onFavoriteToggle={handleFavoriteToggle}
                      imageUrl={nearby.imageUrl}
                      // tags={nearby.tags}
                      variant="compact"
                      onClick={() => router.push(`/bostader/${nearby.id}`)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}