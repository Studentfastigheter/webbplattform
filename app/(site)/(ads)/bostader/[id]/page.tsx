"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import BostadAbout from "@/components/ads/BostadAbout";
import BostadGallery from "@/components/ads/BostadGallery";
import BostadLandlord from "@/components/ads/BostadLandlord";

import { listingService } from "@/services/listing-service";
import { ListingDetailDTO, ListingCardDTO } from "@/types/listing";
// Se till att AdvertiserSummary nu importeras korrekt från där du la den i Steg 1
import { AdvertiserSummary } from "@/types"; 

const ListingsMap = dynamic(() => import("@/components/Map/ListingsMap"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[350px] lg:min-h-[450px] w-full rounded-3xl bg-gray-100 animate-pulse" aria-hidden />
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

export default function ListingDetailPage() {
// ... The rest of the page setup ...
// Note: We are using a simple search/replace trick below.
  const params = useParams<{ id: string }>();
  const listingId = params?.id;
  const router = useRouter();
  
  // FIX: Vi tar inte ut 'token' här, eftersom AuthContext troligen inte exponerar den
  // och listingService använder apiClient som sköter headers automatiskt.
  const { user } = useAuth(); 
  
  const [listing, setListing] = useState<ListingDetailDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!listingId) return;

    setLoading(true);
    setError(null);

    listingService
      .get(listingId)
      .then((res) => {
        if (!active) return;
        setListing(res);
      })
      .catch((err: any) => {
        if (!active) return;
        console.error("Fetch error:", err);
        setError("Kunde inte ladda annonsen.");
        setListing(null);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [listingId]);

  const handleApply = useCallback(() => {
    if (!listingId || !listing) return;
    
    // Om du vill tvinga inloggning:
    if (!user) {
       setApplyError("Du måste vara inloggad för att skicka intresse.");
       return;
    }

    setApplying(true);
    setApplyError(null);
    setApplySuccess(null);

    // FIX: Tog bort 'token' som argument här.
    const action = (listing.ownerType.toLowerCase() === "company" || listing.ownerType === "Företag")
      ? listingService.registerInterest(listingId) 
      : listingService.apply(listingId, "Hej! Jag är intresserad.");

    action
      .then(() => setApplySuccess("Intresseanmälan skickad!"))
      .catch((err: any) => {
        setApplyError(err?.message ?? "Kunde inte skicka intresse.");
      })
      .finally(() => setApplying(false));
  }, [listingId, listing, user]); // Tog bort token från dependencies

  const galleryImages = useMemo(() => {
    return listing?.imageUrls || [];
  }, [listing]);

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
      subtitle: listing.ownerType.toLowerCase() === "company" ? "Företag" : "Privat hyresvärd"
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
      lng: listing.lng
    }];
  }, [listing]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-12 text-center text-gray-500">
          Laddar annons...
        </div>
      );
    }
    
    if (error || !listing || !advertiser) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center text-red-800">
          {error ?? "Annonsen kunde inte hittas."}
        </div>
      );
    }

    return (
      <div className="flex w-full flex-col gap-8">
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

        <BostadAbout 
            listing={listing} 
            onApplyClick={handleApply} 
            applyDisabled={applying} 
        />

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="w-full">
            <BostadGallery 
                title={listing.title} 
                images={galleryImages} 
            />
          </div>
          <div className="w-full min-h-[350px] lg:min-h-[450px] rounded-3xl overflow-hidden border border-black/5 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
            <ListingsMap listings={mapListings} className="h-full w-full object-cover" />
          </div>
        </div>
        
        <BostadLandlord advertiser={advertiser} />
      </div>
    );
  }, [loading, error, listing, advertiser, applySuccess, applyError, galleryImages, handleApply, applying, mapListings]);

  return (
    <main className="container mx-auto px-4 pb-12 pt-6 lg:pt-10 max-w-6xl">
      {content}

      {/* Nearby Listings Section */}
      {!loading && !error && listing && (
        <section className="mt-16 w-full pt-8 border-t border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Fler bostäder i närheten</h2>
          <div className="relative group mx-auto">
            {/* Vänster knapp */}
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

            {/* Höger knapp */}
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
                    isVerified={(nearby as any).verifiedOwner}
                    imageUrl={nearby.imageUrl}
                    tags={nearby.tags}
                    variant="compact"
                    onClick={() => router.push(`/bostader/${nearby.id}`)}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}