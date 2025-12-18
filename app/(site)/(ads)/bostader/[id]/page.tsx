"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import BostadAbout from "@/components/ads/BostadAbout";
import BostadGallery from "@/components/ads/BostadGallery";
import BostadLandlord from "@/components/ads/BostadLandlord";
import { listingService } from "@/services/listing-service";
import { type AdvertiserSummary, type ListingWithRelations } from "@/types";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type ListingDetailPage = ListingWithRelations;

export default function Page() {
  const params = useParams<{ id: string }>();
  const listingId = params?.id;
  const { token } = useAuth();
  const [listing, setListing] = useState<ListingDetailPage | null>(null);
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
        setError(err?.message ?? "Kunde inte ladda annonsen.");
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
    if (!listingId) return;
    if (!token) {
      setApplyError("Du måste vara inloggad för att skicka intresse.");
      setApplySuccess(null);
      return;
    }
    setApplying(true);
    setApplyError(null);
    setApplySuccess(null);
    
    listingService
      .registerInterest(listingId, token)
      .then(() => setApplySuccess("Intresseanmälan skickad."))
      .catch((err: any) => {
        setApplyError(err?.message ?? "Kunde inte skicka intresse.");
      })
      .finally(() => setApplying(false));
  }, [listingId, token]);

  const galleryImages = useMemo(() => {
    if (!listing?.images) return [];
    return (listing.images ?? [])
      .map((img) => (typeof img === "string" ? img : img.imageUrl))
      .filter(Boolean) as string[];
  }, [listing]);

  const advertiser: AdvertiserSummary & { highlights?: string[]; reviewCount?: number } = useMemo(() => {
    if (!listing) {
      // Returnera en tom platshållare om listing inte är laddad
      return {
        id: 0,
        type: "company",
        displayName: "Hyresvärd",
        logoUrl: null,
        bannerUrl: null,
        phone: null,
        contactEmail: null,
        contactPhone: null,
        contactNote: null,
        rating: null,
        subtitle: null,
        description: null,
        website: null,
        city: null,
      };
    }

    if (listing.advertiser) {
      return listing.advertiser;
    }

    // Fallback: skapa advertiser-objekt baserat på listing data
    // HÄR var felet: Vi måste kolla typen innan vi hämtar ID
    const isCompany = listing.listingType === "company";
    
    return {
      // TypeScript vet nu att om type är 'company' finns companyId, annars landlordId
      id: isCompany ? listing.companyId : listing.landlordId,
      type: isCompany ? "company" : "private_landlord",
      displayName: "Hyresvärd",
      logoUrl: null,
      bannerUrl: null,
      phone: null,
      contactEmail: null,
      contactPhone: null,
      contactNote: null,
      rating: null,
      subtitle: null,
      description: null,
      website: null,
      city: listing.city ?? null,
    };
  }, [listing]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-700">
          Laddar annons...
        </div>
      );
    }
    if (error || !listing) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-800">
          {error ?? "Annonsen kunde inte hittas."}
        </div>
      );
    }

    return (
      <>
        {applySuccess && (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {applySuccess}
          </div>
        )}
        {applyError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {applyError}
          </div>
        )}
        <BostadGallery title={listing.title} images={galleryImages} />
        <BostadAbout listing={listing} onApplyClick={handleApply} applyDisabled={applying} />
        <BostadLandlord advertiser={advertiser} />
      </>
    );
  }, [advertiser, applyError, applySuccess, applying, error, galleryImages, handleApply, listing, loading]);

  return (
    <main className="pb-12 pt-6 lg:pt-10">
      <div className="flex w-full flex-col gap-10">{content}</div>
    </main>
  );
}