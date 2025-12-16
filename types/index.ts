// -------------------------
// Helpers & shared aliases
// -------------------------

export type TimestampString = string;
export type DateString = string;
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type City = string;
export type Area = string;
export type UrlString = string;
export type Tag = string;

export type Coordinates = {
  lat?: number | null;
  lng?: number | null;
};

// -------------------------
// ID types
// -------------------------

export type StudentId = number;
export type SchoolId = number;
export type CompanyId = number;
export type LandlordId = number;
export type AccountId = StudentId | CompanyId | LandlordId;
export type TransactionId = number;
export type NotificationId = number;
export type ListingId = string; // uuid
export type ListingImageId = number;
export type ListingLikedId = string; // uuid
export type ListingApplicationId = number;
export type QueueId = string; // uuid
export type QueueApplicationId = string; // uuid
export type WatchlistId = number;
export type ConversationId = number;
export type MessageId = number;

// -------------------------
// Enum-like unions
// -------------------------

export type UserType = "student" | "company" | "private_landlord";
export type AdvertiserType = "company" | "private_landlord";
export type ListingType = "company" | "private";
export type ListingStatus = "available" | string;
export type ListingApplicationStatus =
  | "submitted"
  | "shortlisted"
  | "rejected"
  | "accepted";
export type QueueStatus = "open" | "closed" | "paused";
export type QueueApplicationStatus =
  | "active"
  | "left"
  | "offered"
  | "expired";
export type MessageSenderType = "student" | "private_landlord";

// -------------------------
// Core user accounts
// -------------------------

export type BaseAccount = {
  email: string;
  passwordHash: string;
  phone?: string | null;
  logoUrl?: UrlString | null;
  bannerUrl?: UrlString | null;
  tags?: Tag[] | null;
  city?: City | null;
  settings?: JsonValue | null;
  createdAt: TimestampString;
};

export type School = {
  schoolId: SchoolId;
  schoolName: string;
  city?: City | null;
  lat?: number | null;
  lng?: number | null;
};

export type StudentAccount = BaseAccount & {
  studentId: StudentId;
  type: "student";
  firstName: string;
  surname: string;
  ssn?: string | null;
  schoolId?: SchoolId | null;
  aboutText?: string | null;
  gender?: string | null;
  preferenceText?: string | null;
  verifiedStudent: boolean;
};

export type CompanyAccount = BaseAccount & {
  companyId: CompanyId;
  type: "company";
  name: string;
  orgNumber?: string | null;
  website?: UrlString | null;
  rating?: number | null;
  subtitle?: string | null;
  description?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactNote?: string | null;
  verified: boolean;
};

export type PrivateLandlordAccount = BaseAccount & {
  landlordId: LandlordId;
  type: "private_landlord";
  fullName: string;
  ssn?: string | null;
  subscription?: string | null;
  rating?: number | null;
  description?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactNote?: string | null;
  verified: boolean;
};

export type AdvertiserAccount = CompanyAccount | PrivateLandlordAccount;
export type User = StudentAccount | CompanyAccount | PrivateLandlordAccount;

// -------------------------
// Auth DTOs
// -------------------------

export type AccessToken = string;

export type LoginResponse = {
  accessToken: AccessToken;
  user: User;
};

// -------------------------
// Transactions & notifications
// -------------------------

export type Transaction = {
  transactionId: TransactionId;
  accountType: UserType;
  accountId: AccountId;
  information?: JsonValue | null;
  createdAt: TimestampString;
};

export type UserNotification = {
  notificationId: NotificationId;
  userId: StudentId | LandlordId | CompanyId;
  title?: string | null;
  body?: string | null;
  opened: boolean;
  createdAt: TimestampString;
};

// -------------------------
// Listings
// -------------------------

export type BaseListing = Coordinates & {
  listingId: ListingId;
  title: string;
  area?: Area | null;
  city?: City | null;
  address?: string | null;
  dwellingType?: string | null;
  rooms?: number | null;
  sizeM2?: number | null;
  rent?: number | null;
  moveIn?: DateString | null;
  applyBy?: DateString | null;
  availableFrom?: DateString | null;
  availableTo?: DateString | null;
  description?: string | null;
  tags?: Tag[] | null;
  images?: ListingImage[];
  status: ListingStatus;
  createdAt: TimestampString;
  updatedAt: TimestampString;
};

export type CompanyListing = BaseListing & {
  listingType: "company";
  companyId: CompanyId;
};

export type PrivateListing = BaseListing & {
  listingType: "private";
  landlordId: LandlordId;
  applicationCount?: number | null;
};

export type Listing = CompanyListing | PrivateListing;

export type ListingImage = {
  imageId: ListingImageId;
  listingId: ListingId;
  imageUrl: UrlString;
};

export type StudentLikedListing = {
  listingLikedId: ListingLikedId;
  listingType: ListingType;
  listingId: ListingId;
  studentId: StudentId;
  createdAt: TimestampString;
};

export type ListingApplication = {
  applicationId: ListingApplicationId;
  studentId: StudentId;
  listingId: ListingId;
  listingType: ListingType;
  applicationMessage?: string | null;
  status: ListingApplicationStatus;
  createdAt: TimestampString;
  updatedAt: TimestampString;
};

// -------------------------
// Housing queues
// -------------------------

export type HousingQueue = {
  queueId: QueueId;
  companyId: CompanyId;
  name: string;
  area?: Area | null;
  city?: City | null;
  lat?: number | null;
  lng?: number | null;
  description?: string | null;
  status: QueueStatus;
  totalUnits?: number | null;
  feeInfo?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  website?: UrlString | null;
  tags?: Tag[] | null;
  approximateWaitDays?: number | null;
  createdAt: TimestampString;
  updatedAt: TimestampString;
};

export type StudentQueueApplication = {
  applicationId: QueueApplicationId;
  studentId: StudentId;
  queueId: QueueId;
  joinedAt: TimestampString;
  status: QueueApplicationStatus;
  lastUpdated: TimestampString;
};

// -------------------------
// Search watchlist
// -------------------------

export type StudentSearchWatchlist = {
  watchlistId: WatchlistId;
  studentId: StudentId;
  city?: City | null;
  listingType?: ListingType | null;
  minRent?: number | null;
  maxRent?: number | null;
  minRooms?: number | null;
  maxRooms?: number | null;
  createdAt: TimestampString;
};

// -------------------------
// Messaging
// -------------------------

export type Conversation = {
  conversationId: ConversationId;
  studentId?: StudentId | null;
  privateLandlordId?: LandlordId | null;
  createdAt: TimestampString;
};

export type Message = {
  messageId: MessageId;
  conversationId: ConversationId;
  senderType: MessageSenderType;
  body: string;
  createdAt: TimestampString;
};

// -------------------------
// Relation helpers
// -------------------------

export type AdvertiserSummary = {
  type: AdvertiserType;
  id: CompanyId | LandlordId;
  displayName: string;
  logoUrl?: UrlString | null;
  bannerUrl?: UrlString | null;
  phone?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactNote?: string | null;
  rating?: number | null;
  subtitle?: string | null;
  description?: string | null;
  website?: UrlString | null;
  city?: City | null;
};

export type ListingWithRelations = Listing & {
  advertiser?: AdvertiserSummary;
};

export type HousingQueueWithRelations = HousingQueue & {
  company?: CompanyAccount;
};

export type StudentWithRelations = StudentAccount & {
  school?: School | null;
  likedListings?: StudentLikedListing[];
  listingApplications?: ListingApplication[];
  queueApplications?: StudentQueueApplication[];
  searchWatchlist?: StudentSearchWatchlist[];
  notifications?: UserNotification[];
};
