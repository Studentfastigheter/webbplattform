"use client";

import { useEffect, useMemo, useState } from "react";
import QueueHero from "@/components/ads/QueueHero";
import QueueListings from "@/components/ads/QueueListings";
import QueueRules from "@/components/ads/QueueRules";
import { backendApi } from "@/lib/api";
import { type ListingCardSmallProps } from "@/components/Listings/ListingCard_Small";
import { type HousingQueueWithRelations, type ListingWithRelations } from "@/types";
import { useParams } from "next/navigation";

type QueueDetail = HousingQueueWithRelations;

const DEFAULT_RULES = [
  {
    title: "Studiekrav",
    description: "Antagen pa minst 15 hp per termin.",
  },
  {
    title: "Aktivt konto",
    description: "Profil och kontaktuppgifter ska vara uppdaterade.",
  },
  {
    title: "Svarstid",
    description: "Svarstid 1-2 dagar pa erbjudanden.",
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
    landlordType: listing.advertiser?.displayName ?? "Hyresvard",
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
    Promise.all([
      backendApi.queues.get(queueId),
      backendApi.listings.list({ size: 100 }),
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
        setError(err?.message ?? "Kunde inte ladda kçuppgifter.");
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
          Laddar kç...
        </div>
      );
    }
    if (error || !queue) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-800">
          {error ?? "Kç kunde inte hittas."}
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
    <main className="px-4 py-6 pb-12 lg:px-6 lg:py-10">
      <div className="flex w-full flex-col gap-10">{content}</div>
    </main>
  );
}
