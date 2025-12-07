"use client";

import { useEffect, useMemo, useState } from "react";
import BostadAbout from "@/components/ads/BostadAbout";
import BostadGallery from "@/components/ads/BostadGallery";
import BostadLandlord from "@/components/ads/BostadLandlord";
import { backendApi } from "@/lib/api";
import { type AdvertiserSummary, type ListingWithRelations } from "@/types";
import { useParams } from "next/navigation";

type ListingDetailPage = ListingWithRelations;

export default function Page() {
  const params = useParams<{ id: string }>();
  const listingId = params?.id;
  const [listing, setListing] = useState<ListingDetailPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!listingId) return;
    setLoading(true);
    setError(null);
    backendApi.listings
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

  const galleryImages = useMemo(() => {
    if (!listing?.images) return [];
    return (listing.images ?? [])
      .map((img) => (typeof img === "string" ? img : img.imageUrl))
      .filter(Boolean) as string[];
  }, [listing]);

  const advertiser: AdvertiserSummary & { highlights?: string[]; reviewCount?: number } = useMemo(() => {
    if (!listing) {
      return {
        id: 0,
        type: "company",
        displayName: "Hyresvard",
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
    return (
      listing.advertiser ?? {
        id: listing.companyId,
        type: "company" as const,
        displayName: "Hyresvard",
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
      }
    );
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
        <BostadGallery title={listing.title} images={galleryImages} />
        <BostadAbout listing={listing} />
        <BostadLandlord advertiser={advertiser} />
      </>
    );
  }, [advertiser, error, galleryImages, listing, loading]);

  return (
    <main className="px-4 py-6 pb-12 lg:px-6 lg:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">{content}</div>
    </main>
  );
}
