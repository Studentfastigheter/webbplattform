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
