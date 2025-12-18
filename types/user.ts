import { City, JsonValue, Tag, TimestampString, UrlString } from "./common";

// IDs
export type StudentId = number;
export type CompanyId = number;
export type LandlordId = number;
export type AccountId = StudentId | CompanyId | LandlordId;
export type SchoolId = number; // Flyttad hit då den används i Student
export type ConversationId = number;
export type MessageId = number;
export type NotificationId = number;
export type TransactionId = number;

export type UserType = "student" | "company" | "private_landlord";
export type MessageSenderType = "student" | "private_landlord";

// Base Account
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

// Specific Accounts
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

// Auth
export type AccessToken = string;
export type LoginResponse = {
  accessToken: AccessToken;
  user: User;
};

// Messaging & Notifications
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

export type UserNotification = {
  notificationId: NotificationId;
  userId: StudentId | LandlordId | CompanyId;
  title?: string | null;
  body?: string | null;
  opened: boolean;
  createdAt: TimestampString;
};

export type Transaction = {
  transactionId: TransactionId;
  accountType: UserType;
  accountId: AccountId;
  information?: JsonValue | null;
  createdAt: TimestampString;
};