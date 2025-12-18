"use client";

import { useEffect, useMemo, useState } from "react";
import QueueHero from "@/components/ads/QueueHero";
import QueueListings from "@/components/ads/QueueListings";
import QueueRules from "@/components/ads/QueueRules";
// ÄNDRING: Importera services istället för backendApi
import { queueService } from "@/services/queue-service";
import { listingService } from "@/services/listing-service";
import { type ListingCardSmallProps } from "@/components/Listings/ListingCard_Small";
import { type HousingQueueWithRelations, type ListingWithRelations } from "@/types";
import { useParams } from "next/navigation";

type QueueDetail = HousingQueueWithRelations;

const DEFAULT_RULES = [
  {
    title: "Studiekrav",
    description: "Antagen på minst 15 hp per termin.",
  },
  {
    title: "Aktivt konto",
    description: "Profil och kontaktuppgifter ska vara uppdaterade.",
  },
  {
    title: "Svarstid",
    description: "Svarstid 1-2 dagar på erbjudanden.",
  },
];

const toListingCard = (listing: ListingWithRelations): ListingCardSmallProps => {
  const primaryImage =
    typeof listing.images?.[0] === "string"
      ? (listing.images?.[0] as string)
      : listing.images?.[0]?.imageUrl;
  return {
    title: listing.title,
    area: listing.area ?? "",
    city: listing.city ?? "",
    dwellingType: listing.dwellingType ?? "",
    rooms: listing.rooms ?? undefined,
    sizeM2: listing.sizeM2 ?? undefined,
    rent: listing.rent ?? undefined,
    landlordType: listing.advertiser?.displayName ?? "Hyresvärd",
    isVerified: Boolean(listing.advertiser),
    imageUrl: primaryImage,
    tags: listing.tags ?? undefined,
    advertiser: listing.advertiser,
    images: listing.images,
  };
};

export default function Page() {
  const params = useParams<{ id: string }>();
  const queueId = params?.id;
  const [queue, setQueue] = useState<QueueDetail | null>(null);
  const [listings, setListings] = useState<ListingCardSmallProps[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!queueId) return;
    setLoading(true);
    setError(null);

    // ÄNDRING: Använd services istället för backendApi
    Promise.all([
      queueService.get(queueId),
      listingService.list({ size: 100 }), // Hämtar många för att filtrera client-side (samma logik som förut)
    ])
      .then(([queueRes, listingRes]) => {
        if (!active) return;
        setQueue(queueRes);
        
        const filtered =
          listingRes.items
            ?.filter(
              (l): l is ListingWithRelations & { listingType: "company"; companyId: number } =>
                l.listingType === "company" &&
                typeof l.companyId === "number" &&
                l.companyId === queueRes.companyId
            )
            .map(toListingCard) ?? [];
        setListings(filtered);
      })
      .catch((err: any) => {
        if (!active) return;
        setError(err?.message ?? "Kunde inte ladda köuppgifter.");
        setQueue(null);
        setListings([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [queueId]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-700">
          Laddar kö...
        </div>
      );
    }
    if (error || !queue) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-800">
          {error ?? "Kö kunde inte hittas."}
        </div>
      );
    }

    return (
      <>
        <QueueHero queue={queue} />
        <QueueRules rules={DEFAULT_RULES} />
        <QueueListings listings={listings} />
      </>
    );
  }, [error, listings, loading, queue]);

  return (
    <main className="py-6 pb-12 lg:py-10">
      <div className="flex w-full flex-col gap-10">{content}</div>
    </main>
  );
}