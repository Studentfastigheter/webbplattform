import BostadAbout from "@/components/ads/BostadAbout";
import BostadGallery from "@/components/ads/BostadGallery";
import BostadLandlord from "@/components/ads/BostadLandlord";
import { type AdvertiserSummary, type ListingWithRelations } from "@/types";

type ListingDetailPage = ListingWithRelations & {
  thumbnailUrl?: string;
  images: { imageUrl: string }[];
  advertiser: AdvertiserSummary & {
    reviewCount?: number;
    highlights?: string[];
  };
};

const listingContent: Record<string, ListingDetailPage> = {
  "vasagatan-19": {
    listingId: "vasagatan-19",
    listingType: "company",
    companyId: 1,
    status: "available",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    title: "1:a Vasagatan 19",
    area: "Innerstan",
    city: "Goteborg",
    address: "Vasagatan 19",
    lat: 57.7089,
    lng: 11.9746,
    dwellingType: "Lagenhet",
    rooms: 3,
    sizeM2: 42,
    rent: 3800,
    moveIn: "2026-07-03",
    applyBy: "2026-05-24",
    tags: ["Moblerat", "Poangfri", "Diskmaskin"],
    images: [
      { imageUrl: "/appartment.jpg" },
      { imageUrl: "/appartment.jpg" },
      { imageUrl: "/appartment.jpg" },
      { imageUrl: "/appartment.jpg" },
      { imageUrl: "/appartment.jpg" },
    ],
    thumbnailUrl: "/appartment.jpg",
    description:
      "Snygg citylya i lugnt kvarter. Modern 1a med gott om ljusinslapp, naturnara promenadstrak och trendiga cafeer runt hornet. Tunnelbanan framfor byggnaden tar dig snabbt till centrala stan pa 9 minuter. Bekvama dubbelsangar eller enkelsangar, pentry med alla nodvandigheter, badrum med dusch, smart-TV med Netflix och snabbt Wi-Fi for distansstudier. I samarbete med en specialist erbjuder vi en gratis guidad rundtur i Gamla Stan for alla bokningar.Snygg citylya i lugnt kvarter. Modern 1a med gott om ljusinslapp, naturnara promenadstrak och trendiga cafeer runt hornet. Tunnelbanan framfor byggnaden tar dig snabbt till centrala stan pa 9 minuter. Bekvama dubbelsangar eller enkelsangar, pentry med alla nodvandigheter, badrum med dusch, smart-TV med Netflix och snabbt Wi-Fi for distansstudier. I samarbete med en specialist erbjuder vi en gratis guidad rundtur i Gamla Stan for alla bokningar.Snygg citylya i lugnt kvarter. Modern 1a med gott om ljusinslapp, naturnara promenadstrak och trendiga cafeer runt hornet. Tunnelbanan framfor byggnaden tar dig snabbt till centrala stan pa 9 minuter. Bekvama dubbelsangar eller enkelsangar, pentry med alla nodvandigheter, badrum med dusch, smart-TV med Netflix och snabbt Wi-Fi for distansstudier. I samarbete med en specialist erbjuder vi en gratis guidad rundtur i Gamla Stan for alla bokningar.",
    advertiser: {
      id: 1001,
      type: "company",
      displayName: "SGS Studentbostader",
      subtitle: "Studentbostader",
      logoUrl: "/logos/sgs-logo.svg",
      rating: 4.8,
      reviewCount: 124,
      highlights: [
        "Alla detaljer om boendet finns samlade i SGS-portalen.",
        "Lage nara universitet, cafeer och kollektivtrafik.",
        "Tips om fler studentbostader om du inte far denna.",
        "Support fran SGS kundtjanst vid inflyttning och vardagliga fraga.",
      ],
      contactNote:
        "Kontakta hyresvarden via CampusLyan for fragor eller ombokningar.",
      contactEmail: "kontakt@sgs.se",
    },
  },
};

const defaultListing = listingContent["vasagatan-19"];

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const listing = listingContent[id] ?? defaultListing;

  return (
    <main className="px-4 py-6 pb-12 lg:px-6 lg:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <BostadGallery
          title={listing.title}
          images={listing.images.map((img) => img.imageUrl)}
        />
        <BostadAbout listing={listing} />
        <BostadLandlord advertiser={listing.advertiser} />
      </div>
    </main>
  );
}
