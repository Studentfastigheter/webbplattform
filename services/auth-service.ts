import { apiClient, buildQuery } from "@/lib/api-client";
import {
  User,
  LoginResponse,
  UserType,
  StudentAccount,
  CompanyAccount,
  PrivateLandlordAccount,
} from "@/types";

// --- DTOs ---
type ApiUserResponse = {
  id: number;
  email: string;
  accountType: UserType | string;
  displayName?: string | null;
  createdAt?: string | null;
  firstName?: string | null;
  surname?: string | null;
  ssn?: string | null;
  schoolId?: number | null;
  schoolName?: string | null;
  phone?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  orgNumber?: string | null;
  website?: string | null;
  city?: string | null;
  subtitle?: string | null;
  description?: string | null;
  verified?: boolean | null;
  verifiedStudent?: boolean | null;
  subscription?: string | null;
  rating?: number | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactNote?: string | null;
  tags?: string[] | null;
};

type ApiLoginResponse = { accessToken: string; user: ApiUserResponse };

// --- Mappers ---
const fallbackName = (email?: string | null) =>
  email && email.includes("@") ? email.split("@")[0] : "Användare";

const normalizeUserType = (value?: string | null): UserType => {
  switch ((value ?? "").toLowerCase()) {
    case "company":
      return "company";
    case "private_landlord":
    case "private-landlord":
    case "landlord":
      return "private_landlord";
    default:
      return "student";
  }
};

const mapStudent = (u: ApiUserResponse): StudentAccount => ({
  studentId: u.id,
  type: "student",
  email: u.email,
  passwordHash: "",
  createdAt: u.createdAt ?? new Date().toISOString(),
  phone: u.phone ?? null,
  logoUrl: u.logoUrl ?? null,
  bannerUrl: u.bannerUrl ?? null,
  tags: u.tags ?? null,
  settings: null,
  firstName: u.firstName ?? u.displayName ?? fallbackName(u.email),
  surname: u.surname ?? "",
  ssn: u.ssn ?? null,
  schoolId: u.schoolId ?? null,
  aboutText: u.description ?? null,
  gender: null,
  preferenceText: null,
  city: u.city ?? null,
  verifiedStudent: Boolean(u.verifiedStudent),
});

const mapCompany = (u: ApiUserResponse): CompanyAccount => ({
  companyId: u.id,
  type: "company",
  email: u.email,
  passwordHash: "",
  createdAt: u.createdAt ?? new Date().toISOString(),
  phone: u.phone ?? null,
  logoUrl: u.logoUrl ?? null,
  bannerUrl: u.bannerUrl ?? null,
  tags: u.tags ?? null,
  settings: null,
  name: u.displayName ?? fallbackName(u.email),
  orgNumber: u.orgNumber ?? null,
  city: u.city ?? null,
  website: u.website ?? null,
  rating: u.rating ?? null,
  subtitle: u.subtitle ?? null,
  description: u.description ?? null,
  contactEmail: u.contactEmail ?? null,
  contactPhone: u.contactPhone ?? null,
  contactNote: u.contactNote ?? null,
  verified: Boolean(u.verified),
});

const mapLandlord = (u: ApiUserResponse): PrivateLandlordAccount => ({
  landlordId: u.id,
  type: "private_landlord",
  email: u.email,
  passwordHash: "",
  createdAt: u.createdAt ?? new Date().toISOString(),
  phone: u.phone ?? null,
  logoUrl: u.logoUrl ?? null,
  bannerUrl: u.bannerUrl ?? null,
  tags: u.tags ?? null,
  settings: null,
  fullName: u.displayName ?? fallbackName(u.email),
  ssn: u.ssn ?? null,
  subscription: u.subscription ?? null,
  rating: u.rating ?? null,
  description: u.description ?? null,
  contactEmail: u.contactEmail ?? null,
  contactPhone: u.contactPhone ?? null,
  contactNote: u.contactNote ?? null,
  verified: Boolean(u.verified),
});

export const mapUserResponse = (u: ApiUserResponse): User => {
  const type = normalizeUserType(u.accountType);
  if (type === "company") return mapCompany(u);
  if (type === "private_landlord") return mapLandlord(u);
  return mapStudent(u);
};

// --- Service Methods ---
export type LoginPayload = { email: string; password: string };
type RegisterUserPayload = {
  type: UserType | string;
  ssn: string;
  email: string;
  password: string;
};

export const authService = {
  me: async (token: string): Promise<User> => {
    const user = await apiClient<ApiUserResponse>("/api/auth/me", {}, token);
    return mapUserResponse(user);
  },

  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const res = await apiClient<ApiLoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return { accessToken: res.accessToken, user: mapUserResponse(res.user) };
  },

  register: async (payload: RegisterUserPayload): Promise<User> => {
    const user = await apiClient<ApiUserResponse>("/api/users/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return mapUserResponse(user);
  },

  setSchool: async (schoolId: number, token: string): Promise<User> => {
    const user = await apiClient<ApiUserResponse>(
      `/api/users/me/school${buildQuery({ schoolId })}`,
      { method: "PUT" },
      token
    );
    return mapUserResponse(user);
  },
};