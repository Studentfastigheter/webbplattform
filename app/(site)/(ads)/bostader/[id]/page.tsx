"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import BostadAbout from "@/components/ads/BostadAbout";
import BostadGallery from "@/components/ads/BostadGallery";
import BostadLandlord from "@/components/ads/BostadLandlord";

import { listingService } from "@/services/listing-service";
import { ListingDetailDTO } from "@/types/listing";
// Se till att AdvertiserSummary nu importeras korrekt från där du la den i Steg 1
import { AdvertiserSummary } from "@/types"; 

export default function ListingDetailPage() {
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
    const action = listing.hostType === "Företag"
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
      id: listing.hostId,
      type: listing.hostType === "Företag" ? "company" : "private_landlord",
      displayName: listing.hostName,
      logoUrl: null,
      bannerUrl: null,
      city: null, 
      rating: null,
      website: null,
      description: null,
      phone: null,
      contactEmail: null,
      contactPhone: null,
      contactNote: null,
      subtitle: null
    };
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
      <>
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

        <BostadGallery 
            title={listing.title} 
            images={galleryImages} 
        />
        
        <BostadAbout 
            listing={listing} 
            onApplyClick={handleApply} 
            applyDisabled={applying} 
        />
        
        <BostadLandlord advertiser={advertiser} />
      </>
    );
  }, [loading, error, listing, advertiser, applySuccess, applyError, galleryImages, handleApply, applying]);

  return (
    <main className="container mx-auto px-4 pb-12 pt-6 lg:pt-10 max-w-6xl">
      <div className="flex w-full flex-col gap-8">{content}</div>
    </main>
  );
}