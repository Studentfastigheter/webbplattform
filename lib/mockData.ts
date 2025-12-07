import type {
  AdvertiserSummary,
  CompanyAccount,
  HousingQueue,
  HousingQueueWithRelations,
  ListingImage,
  ListingType,
  ListingWithRelations,
  PrivateLandlordAccount,
  QueueStatus,
  School,
  SchoolId,
} from "@/types";
import type { ListingCardSmallProps } from "@/components/Listings/ListingCard_Small";
import type { ListingApplicationRowProps } from "@/components/Listings/ListingApplicationRow";
import type { QueueRowProps } from "@/components/Queues/QueueRow";
import type { StudentProfile } from "@/components/profile/ProfileHero";

type RichAdvertiser = AdvertiserSummary & {
  reviewCount?: number;
  highlights?: string[];
};

export type ListingFixture = ListingWithRelations & {
  area: string;
  city: string;
  dwellingType: string;
  rooms: number;
  sizeM2: number;
  rent: number;
  landlordType: string;
  imageUrl: string;
  thumbnailUrl?: string;
  advertiser: RichAdvertiser;
  images: ListingImage[];
  isVerified?: boolean;
};

type ListingSeed = Omit<
  ListingFixture,
  | "images"
  | "thumbnailUrl"
  | "advertiser"
  | "listingType"
  | "companyId"
  | "landlordId"
  | "status"
  | "createdAt"
  | "updatedAt"
  | "description"
  | "landlordType"
> & {
  listingType?: ListingType;
  companyId?: number;
  landlordId?: number;
  description?: string;
  images?: (ListingImage | { imageUrl: string })[];
  thumbnailUrl?: string;
  advertiser?: RichAdvertiser;
  moveIn?: string;
  status?: ListingWithRelations["status"];
  createdAt?: string;
  updatedAt?: string;
  landlordType?: string;
};

type CompanySeed = CompanyAccount & {
  highlights?: string[];
  reviewCount?: number;
};

type PrivateLandlordSeed = PrivateLandlordAccount & {
  highlights?: string[];
  reviewCount?: number;
};

const baseDescription =
  "Modern studentbostad med narhet till campus, kollektivtrafik och service. Perfekt balans mellan studiero och stadspuls.";

const defaultTimestamp = "2024-01-01T00:00:00Z";

const buildAdvertiser = (
  id: number,
  displayName: string,
  type: AdvertiserSummary["type"],
  overrides?: Partial<RichAdvertiser>,
): RichAdvertiser => ({
  id,
  displayName,
  type,
  ...overrides,
});

const defaultAdvertiser = buildAdvertiser(
  2000,
  "CampusLyan Partner",
  "company",
  { subtitle: "Hyresvard", logoUrl: "/logos/campuslyan-logo.svg" },
);

export const companyFixtures: CompanySeed[] = [
  {
    companyId: 1,
    type: "company",
    email: "kontakt@sgs.se",
    passwordHash: "hashed-password",
    createdAt: defaultTimestamp,
    name: "SGS Studentbostader",
    orgNumber: "857200-4101",
    phone: "031-333-6300",
    city: "Goteborg",
    website: "https://www.sgs.se",
    rating: 4.8,
    logoUrl: "/logos/sgs-logo.svg",
    bannerUrl:
      "https://media.licdn.com/dms/image/v2/C4E1BAQHejE82dm4OCQ/company-background_10000/company-background_10000/0/1585342521467/sgs_studentbostder_cover?e=1765134000&v=beta&t=DTgoZND8XqmutdxACi5_xIHAFstruoYr_NoEyxwZkCI",
    subtitle: "Studentbostader i Goteborg",
    description:
      "Stort bestand med korridorsrum och lagenheter nara Chalmers och Lindholmen.",
    contactEmail: "kundtjanst@sgs.se",
    contactPhone: "031-333-6300",
    contactNote: "All kontakt sker via SGS-portalen.",
    tags: ["student", "poangfri", "korridor"],
    verified: true,
    highlights: [
      "Poangfri ko for korridor, kortare vantetider.",
      "Tekniksupport vid inflyttning och egen jour.",
    ],
    reviewCount: 124,
  },
  {
    companyId: 2,
    type: "company",
    email: "info@afbostader.se",
    passwordHash: "hashed-password",
    createdAt: defaultTimestamp,
    name: "AF Bostader",
    orgNumber: "845000-7435",
    phone: "046-19 15 00",
    city: "Lund",
    website: "https://www.afbostader.se",
    rating: 4.6,
    logoUrl: "/logos/campuslyan-logo.svg",
    bannerUrl:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
    subtitle: "Poangbaserad ko i Lund",
    description:
      "Driver studentbostader i Lund med fokus pa nara-campus lagenheter.",
    contactEmail: "info@afbostader.se",
    contactPhone: "046-19 15 00",
    contactNote: "Medlemskap krav for att samla poang.",
    tags: ["lund", "poangbaserad"],
    verified: true,
    highlights: [
      "Tydlig statistik per omrade.",
      "Egen felanmalan med jour for akuta arenden.",
    ],
    reviewCount: 98,
  },
  {
    companyId: 3,
    type: "company",
    email: "info@sssb.se",
    passwordHash: "hashed-password",
    createdAt: defaultTimestamp,
    name: "SSSB",
    orgNumber: "802005-5410",
    phone: "08-458-10-10",
    city: "Stockholm",
    website: "https://www.sssb.se",
    rating: 4.3,
    logoUrl: "/logos/campuslyan-logo.svg",
    bannerUrl:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=80",
    subtitle: "Stockholms Studentbostader",
    description: "Poangsystem med kotor i hela Stockholm.",
    contactEmail: "info@sssb.se",
    contactPhone: "08-458-10-10",
    contactNote: "Medlemskap i THS krav for att soka.",
    tags: ["stockholm", "poangsystem"],
    verified: true,
    highlights: [
      "Poang per dag i ko.",
      "Brett utbud av rum, korridorer och familjebostader.",
    ],
    reviewCount: 56,
  },
  {
    companyId: 4,
    type: "company",
    email: "info@bostaden.umea.se",
    passwordHash: "hashed-password",
    createdAt: defaultTimestamp,
    name: "Bostaden Umea",
    orgNumber: "556000-4615",
    phone: "090-17 75 00",
    city: "Umea",
    website: "https://www.bostaden.umea.se",
    rating: 4.1,
    logoUrl: "/logos/campuslyan-logo.svg",
    bannerUrl:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80",
    subtitle: "Kommunala studentbostader",
    description: "Nara campus och city, blandade bostadstyper.",
    contactEmail: "info@bostaden.umea.se",
    contactPhone: "090-17 75 00",
    contactNote: "Prioriterar studenter pa Umea universitet.",
    tags: ["umea", "kommunal"],
    verified: false,
    highlights: [
      "Manga bostader pa cykelavstand fran campus.",
      "Paketboxar och digital nyckelhantering.",
    ],
    reviewCount: 32,
  },
];

export const privateLandlordFixtures: PrivateLandlordSeed[] = [
  {
    landlordId: 201,
    type: "private_landlord",
    email: "lena.berg@example.com",
    passwordHash: "hashed-password",
    createdAt: defaultTimestamp,
    fullName: "Lena Berg",
    phone: "+46 73 555 41 22",
    ssn: "820101-1234",
    subscription: "premium",
    rating: 4.9,
    description: "Hyr ut sekelskifteslya i Linne med delat kok.",
    contactEmail: "lena.berg@example.com",
    contactPhone: "+46 73 555 41 22",
    contactNote: "Svarar snabbast via sms efter kl 17.",
    tags: ["privat", "katter ok", "boende i hushallet"],
    verified: true,
    highlights: [
      "Flexibla visningstider.",
      "Letar efter lugn student med referenser.",
    ],
    reviewCount: 18,
  },
  {
    landlordId: 202,
    type: "private_landlord",
    email: "ahmed.karim@example.com",
    passwordHash: "hashed-password",
    createdAt: defaultTimestamp,
    fullName: "Ahmed Karim",
    phone: "+46 70 888 22 33",
    ssn: "900315-5678",
    subscription: "standard",
    rating: 4.7,
    description: "Erbjuder moderna studios i Sodermalm.",
    contactEmail: "ahmed.karim@example.com",
    contactPhone: "+46 70 888 22 33",
    contactNote: "Kontrakt skrivs digitalt via BankID.",
    tags: ["privat", "snabbt wifi"],
    verified: true,
    highlights: [
      "Egen ingang och tvatt.",
      "Kort promenad till tunnelbana.",
    ],
    reviewCount: 26,
  },
  {
    landlordId: 203,
    type: "private_landlord",
    email: "sara.nordin@example.com",
    passwordHash: "hashed-password",
    createdAt: defaultTimestamp,
    fullName: "Sara Nordin",
    phone: "+46 72 444 10 20",
    ssn: "950620-1122",
    subscription: "basic",
    rating: 4.5,
    description: "Attefallshus i tradgardsstad i Uppsala.",
    contactEmail: "sara.nordin@example.com",
    contactPhone: "+46 72 444 10 20",
    contactNote: "Soker skotsam student, djur ok.",
    tags: ["privat", "uteplats"],
    verified: false,
    highlights: [
      "Egen uteplats och parkering.",
      "Vatten och el ingar.",
    ],
    reviewCount: 12,
  },
  {
    landlordId: 204,
    type: "private_landlord",
    email: "pontus.dahl@example.com",
    passwordHash: "hashed-password",
    createdAt: defaultTimestamp,
    fullName: "Pontus Dahl",
    phone: "+46 76 321 77 99",
    ssn: "880212-3344",
    subscription: "premium",
    rating: 4.8,
    description: "Rum i familjevilla nara LTH med egen ingang.",
    contactEmail: "pontus.dahl@example.com",
    contactPhone: "+46 76 321 77 99",
    contactNote: "Hyr helst ut pa 12 manader eller langre.",
    tags: ["privat", "parkering"],
    verified: true,
    highlights: [
      "Egen ingang, fri parkering.",
      "Tillgang till gym och gardsplan.",
    ],
    reviewCount: 21,
  },
];

const companyById = companyFixtures.reduce<Record<number, CompanySeed>>(
  (acc, company) => {
    acc[company.companyId] = company;
    return acc;
  },
  {},
);

const companyAdvertisers = companyFixtures.reduce<Record<number, RichAdvertiser>>(
  (acc, company) => {
    acc[company.companyId] = buildAdvertiser(
      company.companyId,
      company.name,
      "company",
      {
        logoUrl: company.logoUrl ?? undefined,
        bannerUrl: company.bannerUrl ?? undefined,
        contactEmail: company.contactEmail ?? undefined,
        contactPhone: company.contactPhone ?? undefined,
        contactNote: company.contactNote ?? undefined,
        rating: company.rating ?? undefined,
        subtitle: company.subtitle ?? undefined,
        description: company.description ?? undefined,
        website: company.website ?? undefined,
        city: company.city ?? undefined,
        highlights: company.highlights,
        reviewCount: company.reviewCount,
      },
    );
    return acc;
  },
  {},
);

const landlordAdvertisers = privateLandlordFixtures.reduce<
  Record<number, RichAdvertiser>
>((acc, landlord) => {
  acc[landlord.landlordId] = buildAdvertiser(
    landlord.landlordId,
    landlord.fullName,
    "private_landlord",
    {
      logoUrl: landlord.logoUrl ?? undefined,
      bannerUrl: landlord.bannerUrl ?? undefined,
      contactEmail: landlord.contactEmail ?? undefined,
      contactPhone: landlord.contactPhone ?? undefined,
      contactNote: landlord.contactNote ?? undefined,
      rating: landlord.rating ?? undefined,
      subtitle: landlord.subscription ?? undefined,
      description: landlord.description ?? undefined,
      website: null,
      city: null,
      highlights: landlord.highlights,
      reviewCount: landlord.reviewCount,
    },
  );
  return acc;
}, {});

const schoolFixtures: School[] = [
  {
    schoolId: 1 as SchoolId,
    schoolName: "Chalmers tekniska hogskola",
    city: "Goteborg",
  },
];

export const schoolsById = schoolFixtures.reduce<Record<SchoolId, School>>(
  (acc, school) => {
    acc[school.schoolId] = school;
    return acc;
  },
  {} as Record<SchoolId, School>,
);

let imageIdCounter = 1;

const createListing = ({
  listingId,
  listingType,
  companyId,
  landlordId,
  description,
  images,
  thumbnailUrl,
  advertiser,
  moveIn,
  status,
  createdAt,
  updatedAt,
  landlordType,
  ...rest
}: ListingSeed): ListingFixture => {
  const advertiserFromOwner =
    typeof companyId === "number" && companyAdvertisers[companyId]
      ? companyAdvertisers[companyId]
      : typeof landlordId === "number" && landlordAdvertisers[landlordId]
        ? landlordAdvertisers[landlordId]
        : undefined;

  const resolvedAdvertiser = advertiser ?? advertiserFromOwner ?? defaultAdvertiser;

  const resolvedListingType: ListingType =
    listingType ??
    (typeof companyId === "number"
      ? "company"
      : typeof landlordId === "number"
        ? "private"
        : resolvedAdvertiser.type === "private_landlord"
          ? "private"
          : "company");

  const ownershipFields =
    resolvedListingType === "company"
      ? ({
          listingType: "company" as const,
          companyId: companyId ?? companyFixtures[0].companyId,
        } as const)
      : ({
          listingType: "private" as const,
          landlordId: landlordId ?? privateLandlordFixtures[0].landlordId,
        } as const);

  const landlordLabel =
    landlordType ??
    (ownershipFields.listingType === "company"
      ? companyAdvertisers[ownershipFields.companyId]?.displayName ??
        resolvedAdvertiser.displayName
      : landlordAdvertisers[ownershipFields.landlordId]?.displayName ??
        resolvedAdvertiser.displayName);

  const resolvedImages: ListingImage[] = (
    images ?? [{ imageUrl: rest.imageUrl }]
  ).map((img) =>
    "imageId" in img
      ? img
      : {
          imageId: imageIdCounter++,
          listingId,
          imageUrl: img.imageUrl,
        },
  );

  return {
    ...rest,
    ...ownershipFields,
    listingId,
    landlordType: landlordLabel,
    description: description ?? baseDescription,
    images: resolvedImages,
    thumbnailUrl: thumbnailUrl ?? rest.imageUrl,
    advertiser: resolvedAdvertiser,
    moveIn: moveIn ?? "2025-09-01",
    status: status ?? "available",
    createdAt: createdAt ?? defaultTimestamp,
    updatedAt: updatedAt ?? defaultTimestamp,
    tags: rest.tags ?? [],
  };
};

export const listingFixtures: ListingFixture[] = [
  createListing({
    listingId: "sgs-gibraltargatan-1a",
    listingType: "company",
    companyId: 1,
    title: "1:a Gibraltargatan 9",
    area: "Johanneberg",
    city: "Goteborg",
    address: "Gibraltargatan 9",
    lat: 57.6893,
    lng: 11.9789,
    dwellingType: "Korridor",
    rooms: 1,
    sizeM2: 21,
    rent: 3100,
    landlordType: "Studentbostadsbolag",
    imageUrl: "/appartment.jpg",
    tags: ["Moblerat", "Poangfri", "Nara campus"],
    advertiser: companyAdvertisers[1],
    isVerified: true,
    moveIn: "2025-08-01",
    applyBy: "2025-06-15",
  }),
  createListing({
    listingId: "af-tunavagen-4",
    listingType: "company",
    companyId: 2,
    title: "2:a Tunavagen 4",
    area: "Sparta",
    city: "Lund",
    address: "Tunavagen 4A",
    lat: 55.712,
    lng: 13.207,
    dwellingType: "Lagenhet",
    rooms: 2,
    sizeM2: 50,
    rent: 5600,
    landlordType: "Studentbostadsbolag",
    imageUrl: "/appartment.jpg",
    tags: ["Poangbaserad", "Diskmaskin", "Nara LTH"],
    advertiser: companyAdvertisers[2],
    isVerified: true,
    moveIn: "2025-09-01",
    applyBy: "2025-07-10",
  }),
  createListing({
    listingId: "sssb-kista-studio",
    listingType: "company",
    companyId: 3,
    title: "1:a Kista Nod",
    area: "Kista",
    city: "Stockholm",
    address: "Borgarfjordsgatan 16",
    lat: 59.403,
    lng: 17.944,
    dwellingType: "Lagenhet",
    rooms: 1,
    sizeM2: 28,
    rent: 5200,
    landlordType: "Studentbostadsbolag",
    imageUrl: "/appartment.jpg",
    tags: ["Nara tunnelbana", "Student", "Hiss"],
    advertiser: companyAdvertisers[3],
    isVerified: true,
    moveIn: "2025-10-01",
    applyBy: "2025-08-20",
  }),
  createListing({
    listingId: "umea-campus-2a",
    listingType: "company",
    companyId: 4,
    title: "2:a Nydalahojden",
    area: "Campus",
    city: "Umea",
    address: "Nydalahojden 3",
    lat: 63.821,
    lng: 20.303,
    dwellingType: "Lagenhet",
    rooms: 2,
    sizeM2: 45,
    rent: 4500,
    landlordType: "Kommunal bostad",
    imageUrl: "/appartment.jpg",
    tags: ["Moblerat", "Balkong", "Student"],
    advertiser: companyAdvertisers[4],
  }),
  createListing({
    listingId: "priv-linne-rum-1",
    listingType: "private",
    landlordId: 201,
    title: "Rum i sekelskifteslya",
    area: "Linnestaden",
    city: "Goteborg",
    address: "Plantagatan 4",
    lat: 57.696,
    lng: 11.946,
    dwellingType: "Rum",
    rooms: 1,
    sizeM2: 18,
    rent: 4300,
    landlordType: "Privat uthyrare",
    imageUrl: "/appartment.jpg",
    tags: ["Moblerat", "El ingar", "Delat kok"],
    advertiser: landlordAdvertisers[201],
    moveIn: "2025-07-01",
  }),
  createListing({
    listingId: "priv-sodermalm-studio",
    listingType: "private",
    landlordId: 202,
    title: "Studio Sodermalm",
    area: "Sodermalm",
    city: "Stockholm",
    address: "Katarina Bangata 72",
    lat: 59.3135,
    lng: 18.075,
    dwellingType: "Lagenhet",
    rooms: 1,
    sizeM2: 24,
    rent: 6900,
    landlordType: "Privat uthyrare",
    imageUrl: "/appartment.jpg",
    tags: ["Nara t-bana", "Diskmaskin", "Egen ingang"],
    advertiser: landlordAdvertisers[202],
    isVerified: true,
  }),
  createListing({
    listingId: "priv-uppsala-attefall",
    listingType: "private",
    landlordId: 203,
    title: "Attefallshus Uppsala Norby",
    area: "Norby",
    city: "Uppsala",
    address: "Granfjallsgatan 12",
    lat: 59.833,
    lng: 17.635,
    dwellingType: "Attefall",
    rooms: 1.5,
    sizeM2: 32,
    rent: 5200,
    landlordType: "Privat uthyrare",
    imageUrl: "/appartment.jpg",
    tags: ["Uteplats", "Egen tvatt", "Nara skog"],
    advertiser: landlordAdvertisers[203],
  }),
  createListing({
    listingId: "priv-lund-villa-rum",
    listingType: "private",
    landlordId: 204,
    title: "Rum i villa med egen ingang",
    area: "Annehem",
    city: "Lund",
    address: "Sodra Esplanaden 40",
    lat: 55.697,
    lng: 13.203,
    dwellingType: "Rum",
    rooms: 1,
    sizeM2: 20,
    rent: 4800,
    landlordType: "Privat uthyrare",
    imageUrl: "/appartment.jpg",
    tags: ["Parkeringsplats", "Nara LTH", "Flexibelt kontrakt"],
    advertiser: landlordAdvertisers[204],
    isVerified: true,
  }),
];

export const listingFixtureById = listingFixtures.reduce<
  Record<string, ListingFixture>
>((acc, listing) => {
  acc[listing.listingId] = listing;
  return acc;
}, {});

const toListingCard = (listing: ListingFixture): ListingCardSmallProps => ({
  title: listing.title,
  area: listing.area,
  city: listing.city,
  dwellingType: listing.dwellingType,
  rooms: listing.rooms,
  sizeM2: listing.sizeM2,
  rent: listing.rent,
  landlordType: listing.landlordType,
  isVerified: listing.isVerified,
  imageUrl: listing.thumbnailUrl ?? listing.imageUrl,
  tags: listing.tags ?? undefined,
  advertiser: listing.advertiser,
  images: listing.images,
});

const toListingApplication = (
  listing: ListingFixture,
): Omit<ListingApplicationRowProps, "status" | "applicationDate"> => ({
  listingId: listing.listingId,
  title: listing.title,
  rent: listing.rent,
  area: listing.area,
  city: listing.city,
  dwellingType: listing.dwellingType,
  rooms: listing.rooms,
  sizeM2: listing.sizeM2,
  landlordType: listing.landlordType,
  imageUrl: listing.thumbnailUrl ?? listing.imageUrl,
  isVerified: listing.isVerified,
  tags: listing.tags ?? undefined,
  images: listing.images,
  advertiser: listing.advertiser,
});

// Queues -------------------------------------------------------------

export type QueueStats = {
  status: QueueStatus;
  model?: string;
  approximateWaitLabel?: string;
  totalUnitsLabel?: string;
} & Partial<
  Pick<
    HousingQueue,
    "totalUnits" | "feeInfo" | "approximateWaitDays" | "updatedAt"
  >
>;

export type QueueFixture = HousingQueueWithRelations & {
  advertiser: RichAdvertiser;
  lat: number;
  lng: number;
  unitsLabel?: string | null;
  isVerified?: boolean;
  logoUrl?: string | null;
  bannerImage?: string | null;
  logo?: string | null;
  stats?: QueueStats;
  rules?: { title: string; description: string }[];
};

const defaultQueueMeta = {
  createdAt: defaultTimestamp,
  updatedAt: defaultTimestamp,
};

export const queueFixtures: QueueFixture[] = [
  {
    ...defaultQueueMeta,
    queueId: "queue-sgs",
    companyId: 1,
    company: companyById[1],
    name: "SGS Studentbostader",
    area: "Johanneberg & Lindholmen",
    city: "Goteborg",
    description:
      "Poangfri ko med blandade bostader nara Chalmers, Lindholmen och city.",
    status: "open",
    totalUnits: 1200,
    feeInfo: "Ingen startavgift, serviceavgift 350 kr/ar",
    contactEmail: "kundtjanst@sgs.se",
    contactPhone: "031-333-6300",
    website: "https://www.sgs.se/",
    tags: ["Poangfri", "Student", "Korridor"],
    approximateWaitDays: 45,
    advertiser: companyAdvertisers[1],
    lat: 57.6898,
    lng: 11.9856,
    isVerified: true,
    logoUrl: companyById[1].logoUrl,
    bannerImage: companyById[1].bannerUrl ?? undefined,
    stats: {
      status: "open",
      approximateWaitLabel: "2-8 veckor for korridor",
      model: "Poangfri/forst till kvarn",
      totalUnitsLabel: "1 200 bostader",
      feeInfo: "Serviceavgift 350 kr/ar",
      updatedAt: "Uppdaterad dec 2025",
    },
    rules: [
      {
        title: "Studiekrav",
        description: "Antagen pa minst 15 hp/termin.",
      },
      {
        title: "En ko per person",
        description: "Dubbla konton stangs av enligt SGS villkor.",
      },
      {
        title: "Snabb svarstid",
        description: "Svarstid 24-48 timmar pa erbjudanden.",
      },
    ],
  },
  {
    ...defaultQueueMeta,
    queueId: "queue-af-bostader",
    companyId: 2,
    company: companyById[2],
    name: "AF Bostader",
    area: "Lund centrum & Sparta",
    city: "Lund",
    description: "Poangbaserad ko med nollstallning vid kontrakt.",
    status: "open",
    totalUnits: 2500,
    feeInfo: "Medlemskap + serviceavgift 350 kr/ar",
    contactEmail: "info@afbostader.se",
    contactPhone: "046-19 15 00",
    website: "https://www.afbostader.se/",
    tags: ["Poangbaserad", "Student", "Lagenhet"],
    approximateWaitDays: 210,
    advertiser: companyAdvertisers[2],
    lat: 55.7047,
    lng: 13.191,
    isVerified: true,
    logoUrl: companyById[2].logoUrl,
    bannerImage: companyById[2].bannerUrl ?? undefined,
    stats: {
      status: "open",
      approximateWaitLabel: "6-18 manader beroende pa omrade",
      model: "Poangbaserad ko",
      totalUnitsLabel: "2 500 bostader",
      feeInfo: "Medlemskap och serviceavgift",
      updatedAt: "Uppdaterad okt 2025",
    },
    rules: [
      {
        title: "Poangsystem",
        description: "En poang per dag i kon, pausas vid kontrakt.",
      },
      {
        title: "Medlemskap",
        description: "Aktivt medlemskap krav for att samla poang.",
      },
      {
        title: "Omflytt",
        description: "Internomflytt sker i samma portal.",
      },
    ],
  },
  {
    ...defaultQueueMeta,
    queueId: "queue-sssb",
    companyId: 3,
    company: companyById[3],
    name: "SSSB",
    area: "Innerstan & Kista",
    city: "Stockholm",
    description: "Poangsystem med THS-medlemskap och flerbostadsomraden.",
    status: "open",
    totalUnits: 8000,
    feeInfo: "Medlemskap i THS + arlig avgift",
    contactEmail: "info@sssb.se",
    contactPhone: "08-458-10-10",
    website: "https://www.sssb.se/",
    tags: ["Stockholm", "Poangsystem", "Student"],
    approximateWaitDays: 365,
    advertiser: companyAdvertisers[3],
    lat: 59.3471,
    lng: 18.073,
    isVerified: true,
    logoUrl: companyById[3].logoUrl,
    bannerImage: companyById[3].bannerUrl ?? undefined,
    stats: {
      status: "open",
      approximateWaitLabel: "8-24 manader beroende pa omrade",
      model: "Poangsystem, THS-medlemskap",
      totalUnitsLabel: "8 000 bostader",
      feeInfo: "THS medlemskap + arlig avgift",
      updatedAt: "Uppdaterad nov 2025",
    },
    rules: [
      {
        title: "Medlemskap",
        description: "THS-medlemskap krav for att samla poang.",
      },
      {
        title: "Aktiv profil",
        description: "Profil och intyg maste vara uppdaterade.",
      },
      {
        title: "Svarstid",
        description: "Svarstid 1-2 dagar pa erbjudanden.",
      },
    ],
  },
  {
    ...defaultQueueMeta,
    queueId: "queue-bostaden-umea",
    companyId: 4,
    company: companyById[4],
    name: "Bostaden Umea",
    area: "Campus & Tomtebo",
    city: "Umea",
    description: "Kommunal bostadsko med blandade storlekar nara campus.",
    status: "open",
    totalUnits: 950,
    feeInfo: "Ingen registreringsavgift, digital avisering",
    contactEmail: "info@bostaden.umea.se",
    contactPhone: "090-17 75 00",
    website: "https://www.bostaden.umea.se/",
    tags: ["Kommunal", "Student", "Korridor"],
    approximateWaitDays: 90,
    advertiser: companyAdvertisers[4],
    lat: 63.825,
    lng: 20.275,
    isVerified: false,
    logoUrl: companyById[4].logoUrl,
    bannerImage: companyById[4].bannerUrl ?? undefined,
    stats: {
      status: "open",
      approximateWaitLabel: "1-4 manader for korridor",
      model: "Kombinerad ko/forst till kvarn for korttid",
      totalUnitsLabel: "950 bostader",
      feeInfo: "Ingen startavgift",
      updatedAt: "Uppdaterad nov 2025",
    },
    rules: [
      {
        title: "Studentstatus",
        description: "Prioriterar aktiva studenter vid Umea universitet.",
      },
      {
        title: "Korttidsboende",
        description: "Forst till kvarn pa korttidsbostader.",
      },
      {
        title: "Boendebegransning",
        description: "Max 2 kontrakt samtidigt per hushall.",
      },
    ],
  },
];

export const queueFixtureById = queueFixtures.reduce<
  Record<string, QueueFixture>
>((acc, queue) => {
  acc[queue.queueId] = queue;
  return acc;
}, {});

const listingCardsByCompanyId = listingFixtures.reduce<
  Record<number, ListingCardSmallProps[]>
>((acc, listing) => {
  if (listing.listingType === "company" && listing.companyId) {
    const card = toListingCard(listing);
    acc[listing.companyId] = acc[listing.companyId] ?? [];
    acc[listing.companyId].push(card);
  }
  return acc;
}, {});

const defaultQueueListings = listingFixtures
  .filter((listing) => listing.listingType === "company")
  .slice(0, 4)
  .map(toListingCard);

export const queueListingsByQueueId: Record<string, ListingCardSmallProps[]> =
  queueFixtures.reduce((acc, queue) => {
    acc[queue.queueId] =
      listingCardsByCompanyId[queue.companyId] ?? defaultQueueListings;
    return acc;
  }, {} as Record<string, ListingCardSmallProps[]>);

const statusToRowStatus = (status: QueueStatus): QueueRowProps["status"] => {
  if (status === "open") return "Aktiv";
  if (status === "paused") return "Bearbetas";
  return "Inaktiv";
};

export const queueRowFixtures: QueueRowProps[] = queueFixtures.map((queue) => ({
  id: queue.queueId,
  name: queue.name,
  logoUrl:
    queue.logoUrl ??
    queue.advertiser.logoUrl ??
    "/logos/campuslyan-logo.svg",
  cities: queue.city ? [queue.city] : [],
  status: statusToRowStatus(queue.status),
  days: queue.approximateWaitDays ?? 0,
}));

// Applications -------------------------------------------------------

export const listingApplicationFixtures: ListingApplicationRowProps[] = [
  {
    ...toListingApplication(listingFixtureById["sgs-gibraltargatan-1a"]),
    status: "Aktiv",
    applicationDate: "2025-06-03",
  },
  {
    ...toListingApplication(listingFixtureById["priv-sodermalm-studio"]),
    status: "Under granskning",
    applicationDate: "2025-06-08",
  },
];

// Profile ------------------------------------------------------------

export const studentProfileFixture: StudentProfile = {
  studentId: 101,
  type: "student",
  email: "amelie.lindberg@student.chalmers.se",
  passwordHash: "",
  createdAt: "2024-11-14T00:00:00Z",
  firstName: "Amelie",
  surname: "Lindberg",
  phone: "+46 73 555 11 22",
  city: "Goteborg",
  verifiedStudent: true,
  schoolId: 1,
  school: schoolsById[1],
  bannerImage:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
  avatarUrl:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=320&q=80",
  aboutText:
    "Hej! Jag ar inne pa termin 5 pa Dataingenjorsprogrammet och jobbar extra som studentambassador. Jag tranar mycket, foredrar lugna fastigheter och uppskattar hyresvardar som har smidig felanmalan och tydlig kommunikation. Jag soker ett langsiktigt forstahandskontrakt och tar garna referenser fran tidigare boende.",
  preferenceText:
    "Dromboendet ar en ljus 1:a eller 2:a med gott om forvaring och cykelrum. Balkong eller uteplats ar ett plus men inget krav.",
  tags: ["Dataingenjor", "Goteborg", "Inflytt feb 2026", "Maxhyra 5 800 kr"],
  stats: {
    studyProgram: "Dataingenjor, termin 5",
    studyPace: "100% studietakt",
    preferredArea: "Goteborg - Johanneberg, Vasastan, Linne",
    housingType: "1:a/2:a - minst 22 m2",
    budget: "Max 5 800 kr/manad",
    moveIn: "Februari 2026",
    queueActivity: "4 aktiva kor - 2 ansokningar igang",
    updatedAt: "Uppdaterad 2 dec 2025",
  },
};
