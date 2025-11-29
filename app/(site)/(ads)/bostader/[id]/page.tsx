import BostadAbout from "@/components/ads/BostadAbout";
import BostadGallery from "@/components/ads/BostadGallery";
import BostadLandlord from "@/components/ads/BostadLandlord";
import type { ListingDetail } from "@/components/ads/types";

const listingContent: Record<string, ListingDetail> = {
  "vasagatan-19": {
    id: "vasagatan-19",
    title: "1:a Vasagatan 19",
    area: "Innerstan",
    city: "Goteborg",
    address: "Vasagatan 19",
    dwellingType: "Lagenhet",
    rooms: "3 rum",
    size: "42 m2",
    rent: 3800,
    moveIn: "2026-07-03",
    applyBy: "2026-05-24",
    tags: ["Moblerat", "Poangfri", "Diskmaskin"],
    images: [
      "/appartment.jpg",
      "/appartment.jpg",
      "/appartment.jpg",
      "/appartment.jpg",
      "/appartment.jpg",
    ],
    description:
      "Snygg citylya i lugnt kvarter. Modern 1a med gott om ljusinslapp, naturnara promenadstrak och trendiga cafeer runt hornet. Tunnelbanan framfor byggnaden tar dig snabbt till centrala stan pa 9 minuter. Bekvama dubbelsangar eller enkelsangar, pentry med alla nodvandigheter, badrum med dusch, smart-TV med Netflix och snabbt Wi-Fi for distansstudier. I samarbete med en specialist erbjuder vi en gratis guidad rundtur i Gamla Stan for alla bokningar.Snygg citylya i lugnt kvarter. Modern 1a med gott om ljusinslapp, naturnara promenadstrak och trendiga cafeer runt hornet. Tunnelbanan framfor byggnaden tar dig snabbt till centrala stan pa 9 minuter. Bekvama dubbelsangar eller enkelsangar, pentry med alla nodvandigheter, badrum med dusch, smart-TV med Netflix och snabbt Wi-Fi for distansstudier. I samarbete med en specialist erbjuder vi en gratis guidad rundtur i Gamla Stan for alla bokningar.Snygg citylya i lugnt kvarter. Modern 1a med gott om ljusinslapp, naturnara promenadstrak och trendiga cafeer runt hornet. Tunnelbanan framfor byggnaden tar dig snabbt till centrala stan pa 9 minuter. Bekvama dubbelsangar eller enkelsangar, pentry med alla nodvandigheter, badrum med dusch, smart-TV med Netflix och snabbt Wi-Fi for distansstudier. I samarbete med en specialist erbjuder vi en gratis guidad rundtur i Gamla Stan for alla bokningar.",
    landlord: {
      name: "SGS Studentbostader",
      subtitle: "Studentbostader",
      logo: "/logos/sgs-logo.svg",
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
        <BostadGallery title={listing.title} images={listing.images} />
        <BostadAbout listing={listing} />
        <BostadLandlord landlord={listing.landlord} />
      </div>
    </main>
  );
}
