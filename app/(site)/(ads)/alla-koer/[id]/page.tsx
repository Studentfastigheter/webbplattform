import QueueHero from "@/components/ads/QueueHero";
import QueueListings from "@/components/ads/QueueListings";
import QueueRules from "@/components/ads/QueueRules";
import type { ListingCardSmallProps } from "@/components/Listings/ListingCard_Small";
import {
  type AdvertiserSummary,
  type HousingQueue,
  type QueueStatus,
} from "@/types";

type QueueStats = {
  status: QueueStatus;
  approximateWait?: string;
  model?: string;
  totalUnits?: string;
  feeInfo?: string;
  updatedAt?: string;
};

type QueueDetail = HousingQueue & {
  advertiser: AdvertiserSummary & { reviewCount?: number; highlights?: string[] };
  stats: QueueStats;
  rules: { title: string; description: string }[];
  bannerImage?: string | null;
  logo?: string | null;
};

const queueContent: Record<string, QueueDetail> = {
  "sgs-studentbostader": {
    queueId: "sgs-studentbostader",
    companyId: 1001,
    status: "open",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    name: "SGS Studentbostäder",
    area: "Innerstan",
    city: "Göteborg",
    advertiser: {
      id: 1001,
      type: "company",
      displayName: "SGS Studentbostäder",
      subtitle: "Studentbostäder i Göteborg",
      logoUrl: "/logos/sgs-logo.svg",
      bannerUrl:
        "https://media.licdn.com/dms/image/v2/C4E1BAQHejE82dm4OCQ/company-background_10000/company-background_10000/0/1585342521467/sgs_studentbostder_cover?e=1765134000&v=beta&t=DTgoZND8XqmutdxACi5_xIHAFstruoYr_NoEyxwZkCI",
      rating: 4.8,
      reviewCount: 124,
      highlights: [
        "All hantering av kontrakt och erbjudanden sker i SGS-portalen.",
        "Erbjuder korridorer, ettor och familjebostäder nära campus.",
        "Kundservice guidar dig i inflyttning, nycklar och bytesregler.",
        "Möjlighet att prenumerera på bostadsutskick för din studieort.",
      ],
      contactNote: "Frågor om specifika objekt hanteras via Mina sidor hos SGS.",
      website: "https://www.sgs.se/",
    },
    logo: "/logos/sgs-logo.svg",
    bannerImage: "https://media.licdn.com/dms/image/v2/C4E1BAQHejE82dm4OCQ/company-background_10000/company-background_10000/0/1585342521467/sgs_studentbostder_cover?e=1765134000&v=beta&t=DTgoZND8XqmutdxACi5_xIHAFstruoYr_NoEyxwZkCI",
    description:
      "SGS driver en av Sveriges största studentbostadsköer. Korridorsrum går oftast på först till kvarn medan lägenheter kräver lite längre väntetid. Köreglerna är transparenta och kontroller sker mot ditt studieintyg inför kontrakt.",
    tags: ["Student", "Korridor", "Poängfri", "Göteborg"],
    stats: {
      status: "open",
      approximateWait: "2–6 veckor för korridor, 4–12 månader för lägenhet",
      model: "Poängfri, först till kvarn på korridor",
      totalUnits: "1 200 bostäder",
      feeInfo: "Ingen startavgift, 350 kr serviceavgift/år",
      updatedAt: "Uppdaterad november 2025",
    },
    rules: [
      {
        title: "Studiekrav",
        description:
          "Du behöver vara antagen eller registrerad vid högskola/universitet på minst 15 hp/termin.",
      },
      {
        title: "En köplats per person",
        description:
          "Kontrollera att dina uppgifter är korrekta, dubbla konton stängs av enligt SGS villkor.",
      },
      {
        title: "Svara snabbt",
        description:
          "När du får ett erbjudande har du 1–2 dagar att tacka ja, annars går bostaden vidare i kön.",
      },
    ],
    contactEmail: "kundtjanst@sgs.se",
    contactPhone: "031-333-6300",
    website: "https://www.sgs.se/",
  },
  "af-bostader": {
    queueId: "af-bostader",
    companyId: 1004,
    status: "open",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    name: "AF Bostäder",
    area: "Lund Centrum",
    city: "Lund",
    advertiser: {
      id: 1004,
      type: "company",
      displayName: "AF Bostäder",
      subtitle: "Studentbostäder i Lund",
      logoUrl: "/logos/campuslyan-logo.svg",
      rating: 4.6,
      reviewCount: 98,
      highlights: [
        "Poängbaserad kö med tydlig statistik per område och bostadstyp.",
        "Eget underhållscentrum och jour vid akuta fel.",
        "Nyproduktionsprojekt kommuniceras i förväg i portalen.",
      ],
      contactNote:
        "Kontakta AF Bostäder via Mina sidor för frågor om specifika objekt.",
      website: "https://www.afbostader.se/",
    },
    logo: "/logos/campuslyan-logo.svg",
    description:
      "AF Bostäder erbjuder korridorer och lägenheter i flera områden runt campus i Lund. Kötiden varierar mycket mellan studentkvarteren och publiceras löpande i statistiken. Poäng delas ut per dag med aktiva studier och du kan pausa kön vid utbytesstudier.",
    tags: ["Student", "Poängbaserad", "Lund", "Korridor"],
    stats: {
      status: "paused",
      approximateWait: "6–18 månader beroende på område",
      model: "Poängbaserad kö",
      totalUnits: "2 500 bostäder",
      feeInfo: "Medlemskap + serviceavgift 350 kr/år",
      updatedAt: "Uppdaterad oktober 2025",
    },
    rules: [
      {
        title: "Aktiva studier",
        description:
          "Du måste läsa minst 15 hp/termin vid Lunds universitet eller motsvarande.",
      },
      {
        title: "Poängsystem",
        description:
          "En poäng per dag i kön. Poäng fryses vid hyrt boende och återaktiveras vid utflytt.",
      },
      {
        title: "Omflytt",
        description:
          "Internomflyttning kräver fullgjord uppsägningstid och sköts i samma portal.",
      },
    ],
    contactEmail: "info@afbostader.se",
    contactPhone: "046-19 15 00",
    website: "https://www.afbostader.se/",
  },
};

const defaultQueue = queueContent["sgs-studentbostader"];

const queueListingsContent: Record<string, ListingCardSmallProps[]> = {
  "sgs-studentbostader": [
    {
      title: "1:a Vasagatan 19",
      area: "Innerstan",
      city: "Göteborg",
      dwellingType: "Lägenhet",
      rooms: 3,
      sizeM2: 42,
      rent: 3800,
      landlordType: "Privat värd",
      isVerified: true,
      imageUrl: "/appartment.jpg",
      tags: ["Möblerat", "Poängfri", "Diskmaskin"],
    },
    {
      title: "1:a Chalmersgatan 5",
      area: "Vasastan",
      city: "Göteborg",
      dwellingType: "Korridor",
      rooms: 1,
      sizeM2: 20,
      rent: 3100,
      landlordType: "Privat värd",
      isVerified: true,
      imageUrl: "/appartment.jpg",
      tags: ["Möblerat", "El ingår", "Närhet till campus"],
    },
    {
      title: "2:a Engelbrektsgatan 2",
      area: "Lorensberg",
      city: "Göteborg",
      dwellingType: "Lägenhet",
      rooms: 2,
      sizeM2: 48,
      rent: 5200,
      landlordType: "Stiftelse",
      isVerified: true,
      imageUrl: "/appartment.jpg",
      tags: ["Balkong", "Diskmaskin", "Poängfri"],
    },
    {
      title: "1:a Molinsgatan 14",
      area: "Linné",
      city: "Göteborg",
      dwellingType: "Korridor",
      rooms: 1,
      sizeM2: 18,
      rent: 2900,
      landlordType: "Privat värd",
      isVerified: false,
      imageUrl: "/appartment.jpg",
      tags: ["El ingår", "Möblerat", "Student"],
    },
    {
      title: "3:a Redbergsvägen 21",
      area: "Örgryte",
      city: "Göteborg",
      dwellingType: "Lägenhet",
      rooms: 3,
      sizeM2: 66,
      rent: 6400,
      landlordType: "Stiftelse",
      isVerified: true,
      imageUrl: "/appartment.jpg",
      tags: ["Balkong", "Diskmaskin", "Närhet till spårvagn"],
    },
    {
      title: "1:a Holtermansgatan 6",
      area: "Chalmers",
      city: "Göteborg",
      dwellingType: "Korridor",
      rooms: 1,
      sizeM2: 19,
      rent: 3050,
      landlordType: "Studentbostad",
      isVerified: true,
      imageUrl: "/appartment.jpg",
      tags: ["El ingår", "Möblerat", "Nära campus"],
    },
    {
      title: "2:a Gibraltargatan 9",
      area: "Chalmers",
      city: "Göteborg",
      dwellingType: "Lägenhet",
      rooms: 2,
      sizeM2: 44,
      rent: 4800,
      landlordType: "Studentbostad",
      isVerified: false,
      imageUrl: "/appartment.jpg",
      tags: ["Diskmaskin", "Förråd", "Nära campus"],
    },
    {
      title: "1:a Norra Allégatan 3",
      area: "Haga",
      city: "Göteborg",
      dwellingType: "Korridor",
      rooms: 1,
      sizeM2: 21,
      rent: 3200,
      landlordType: "Studentbostad",
      isVerified: true,
      imageUrl: "/appartment.jpg",
      tags: ["Möblerat", "Poängfri", "Diskmaskin"],
    },
  ],
  "af-bostader": [
    {
      title: "1:a Sandgatan 12",
      area: "Lund Centrum",
      city: "Lund",
      dwellingType: "Korridor",
      rooms: 1,
      sizeM2: 20,
      rent: 3200,
      landlordType: "Studentbostad",
      isVerified: true,
      imageUrl: "/appartment.jpg",
      tags: ["Möblerat", "Poängfri", "Diskmaskin"],
    },
    {
      title: "2:a Tunavägen 4",
      area: "Sparta",
      city: "Lund",
      dwellingType: "Lägenhet",
      rooms: 2,
      sizeM2: 50,
      rent: 5600,
      landlordType: "Stiftelse",
      isVerified: true,
      imageUrl: "/appartment.jpg",
      tags: ["Balkong", "Diskmaskin", "Närhet till LTH"],
    },
    {
      title: "1:a Ole Römers väg 8",
      area: "IDEON",
      city: "Lund",
      dwellingType: "Korridor",
      rooms: 1,
      sizeM2: 18,
      rent: 3000,
      landlordType: "Studentbostad",
      isVerified: false,
      imageUrl: "/appartment.jpg",
      tags: ["Möblerat", "El ingår", "Närhet till campus"],
    },
    {
      title: "3:a Magistratsvägen 12",
      area: "Vildanden",
      city: "Lund",
      dwellingType: "Lägenhet",
      rooms: 3,
      sizeM2: 70,
      rent: 7100,
      landlordType: "Stiftelse",
      isVerified: true,
      imageUrl: "/appartment.jpg",
      tags: ["Balkong", "Diskmaskin", "Familjebostad"],
    },
    {
      title: "1:a Tomegapsgatan 3",
      area: "Lund Centrum",
      city: "Lund",
      dwellingType: "Korridor",
      rooms: 1,
      sizeM2: 19,
      rent: 3150,
      landlordType: "Studentbostad",
      isVerified: true,
      imageUrl: "/appartment.jpg",
      tags: ["Möblerat", "Poängfri", "Diskmaskin"],
    },
    {
      title: "2:a Kämnärsvägen 10",
      area: "Kämnärsrätten",
      city: "Lund",
      dwellingType: "Lägenhet",
      rooms: 2,
      sizeM2: 46,
      rent: 4950,
      landlordType: "Stiftelse",
      isVerified: true,
      imageUrl: "/appartment.jpg",
      tags: ["Balkong", "Förråd", "Närhet till universitet"],
    },
    {
      title: "2:a Parternas gränd 5",
      area: "Lund Norra",
      city: "Lund",
      dwellingType: "Lägenhet",
      rooms: 2,
      sizeM2: 52,
      rent: 5350,
      landlordType: "Studentbostad",
      isVerified: false,
      imageUrl: "/appartment.jpg",
      tags: ["Diskmaskin", "Tvättmaskin", "Student"],
    },
    {
      title: "1:a Tunavägen 16",
      area: "Sparta",
      city: "Lund",
      dwellingType: "Korridor",
      rooms: 1,
      sizeM2: 17,
      rent: 2950,
      landlordType: "Studentbostad",
      isVerified: true,
      imageUrl: "/appartment.jpg",
      tags: ["Möblerat", "El ingår", "Nära LTH"],
    },
  ],
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queue = queueContent[id] ?? defaultQueue;
  const listings = queueListingsContent[id] ?? queueListingsContent["sgs-studentbostader"];

  return (
    <main className="px-4 py-6 pb-12 lg:px-6 lg:py-10">
      <div className="flex w-full flex-col gap-10">
        <QueueHero queue={queue} />
        <QueueRules rules={queue.rules}/>
        <QueueListings listings={listings} />
      </div>
    </main>
  );
}
