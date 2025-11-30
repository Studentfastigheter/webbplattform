export type LandlordInfo = {
  name: string;
  subtitle: string;
  logo?: string;
  rating?: number;
  reviewCount?: number;
  highlights: string[];
  contactNote?: string;
};

export type ListingDetail = {
  id: string;
  title: string;
  area: string;
  city: string;
  address: string;
  dwellingType: string;
  rooms: string;
  size: string;
  rent: number;
  moveIn: string;
  applyBy: string;
  tags: string[];
  description: string;
  images: string[];
  landlord: LandlordInfo;
};

export type QueueStats = {
  status: "open" | "queue";
  approximateWait: string;
  model: string;
  totalUnits?: string;
  feeInfo?: string;
  updatedAt?: string;
};

export type QueueRule = {
  title: string;
  description: string;
};

export type QueueStep = {
  title: string;
  description: string;
};

export type QueueDetail = {
  id: string;
  name: string;
  area: string;
  city: string;
  landlord: LandlordInfo;
  bannerImage?: string;
  logo?: string;
  description: string;
  tags: string[];
  images?: string[];
  stats: QueueStats;
  rules: QueueRule[];
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
};
