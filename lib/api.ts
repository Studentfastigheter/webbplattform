import {
  type CompanyAccount,
  type CompanyId,
  type HousingQueueWithRelations,
  type ListingImage,
  type ListingWithRelations,
  type LoginResponse,
  type PrivateLandlordAccount,
  type School,
  type QueueStatus,
  type StudentAccount,
  type User,
  type UserType,
} from "@/types";

export const API_BASE =
  typeof window === "undefined"
    ? process.env.API_BASE ?? process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080"
    : process.env.NEXT_PUBLIC_API_BASE ?? "";

const STATUS_MESSAGES: Record<number, string> = {
  400: "Ogiltig förfrågan. Kontrollera fälten och försök igen.",
  401: "Fel e-post eller lösenord.",
  403: "Du har inte behörighet att göra detta.",
  404: "Vi kunde inte hitta det du söker.",
  409: "Uppgifterna används redan. Prova med en annan kombination.",
  422: "Vissa fält saknas eller är felaktiga.",
  429: "För många försök, vänta en stund och prova igen.",
  500: "Serverfel. Försök igen om en liten stund.",
  503: "Tjänsten är tillfälligt nere. Försök igen snart.",
};

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

export type LoginPayload = { email: string; password: string };

type ApiListingPublicDto = {
  id: string;
  area?: string | null;
  title: string;
  city?: string | null;
  rent?: number | null;
  primaryImageUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  companyName?: string | null;
  distanceToSchoolKm?: number | null;
  sizeM2?: number | null;
  rooms?: number | null;
  dwellingType?: string | null;
  moveIn?: string | null;
  applyBy?: string | null;
  availableFrom?: string | null;
  tags?: string[] | null;
  images?: string[];
};

type ApiListingPrivateDto = ApiListingPublicDto & {
  description?: string | null;
  address?: string | null;
  companyId?: number | null;
  userQueueDays?: number | null;
};

type ApiQueueCompanyDto = {
  id: number;
  name: string;
  city?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  subtitle?: string | null;
  description?: string | null;
  website?: string | null;
  rating?: number | null;
  verified?: boolean | null;
  tags?: string[] | null;
};

type ApiQueueDto = {
  id: string;
  companyId: number;
  name: string;
  area?: string | null;
  city?: string | null;
  description?: string | null;
  status: string;
  totalUnits?: number | null;
  feeInfo?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  website?: string | null;
  tags?: string[] | null;
  approximateWaitDays?: number | null;
  updatedAt?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  company?: ApiQueueCompanyDto | null;
};

type ApiListingSearchResponse<T> = {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
};

type ApiActivityDto = {
  id: number;
  name: string;
  category: string;
  latitude?: number | null;
  longitude?: number | null;
  distanceKm?: number | null;
};

type ApiInterestDto = {
  listingId: string | null;
  title: string | null;
  city: string | null;
  rent: number | null;
  primaryImageUrl: string | null;
  companyName: string | null;
  createdAt: string;
};

type ApiSchoolDto = {
  id: number;
  name: string;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type ApiSchoolQueueDto = {
  companyId: number;
  companyName: string;
  userQueueDays?: number | null;
  listingsCount?: number | null;
};

type ApiQueueEntryDto = {
  queueId: string;
  companyId: number;
  queueName: string;
  companyName: string;
  joinedAt: string;
  queueDays: number;
};

type RawAd = {
  id?: number;
  company?: string;
  start?: string;
  stop?: string;
  data?: unknown;
};

export type PaginatedResult<T> = ApiListingSearchResponse<T>;

export type QueueEntry = ApiQueueEntryDto;
export type ListingActivity = ApiActivityDto;
export type UserInterest = {
  listingId: string;
  title: string | null;
  city: string | null;
  rent: number | null;
  primaryImageUrl: string | null;
  companyName: string | null;
  createdAt: string;
};
export type SchoolQueueSummary = ApiSchoolQueueDto;

function buildQuery(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).length > 0) {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  let res: Response;
  try {
    res = await fetch(url, { ...options, headers, cache: "no-store" });
  } catch (err) {
    throw new Error((err as Error)?.message || "Kunde inte nå servern.");
  }

  const rawBody = await res.text().catch(() => "");
  let parsed: unknown = undefined;

  if (rawBody) {
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      parsed = rawBody;
    }
  }

  if (!res.ok) {
    const message =
      (parsed &&
        typeof parsed === "object" &&
        (parsed as any).reason) ||
      (parsed && typeof parsed === "object" && (parsed as any).message) ||
      (typeof parsed === "string" && parsed) ||
      STATUS_MESSAGES[res.status] ||
      res.statusText ||
      `Något gick fel (${res.status}).`;
    throw new Error(String(message));
  }

  if (!rawBody) return undefined as T;
  return parsed as T;
}

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

const mapUserResponse = (u: ApiUserResponse): User => {
  const type = normalizeUserType(u.accountType);
  if (type === "company") return mapCompany(u);
  if (type === "private_landlord") return mapLandlord(u);
  return mapStudent(u);
};

const toListingImages = (dto: {
  id: string;
  primaryImageUrl?: string | null;
  images?: string[];
}): ListingImage[] => {
  const urls: string[] = [];
  if (dto.primaryImageUrl) urls.push(dto.primaryImageUrl);
  if (dto.images?.length) urls.push(...dto.images);
  const unique = Array.from(new Set(urls));
  return unique.map((imageUrl, idx) => ({
    imageId: idx + 1,
    listingId: dto.id,
    imageUrl,
  }));
};

const mapListingDto = (
  dto: ApiListingPublicDto | ApiListingPrivateDto
): ListingWithRelations => {
  const now = new Date().toISOString();
  const companyId =
    "companyId" in dto && dto.companyId ? Number(dto.companyId) : 0;
  const advertiser =
    dto.companyName || companyId
      ? {
          type: "company" as const,
          id: (companyId || 0) as CompanyId,
          displayName: dto.companyName ?? "Hyresvärd",
          logoUrl: null,
          bannerUrl: null,
          phone: null,
          contactEmail: null,
          contactPhone: null,
          contactNote: null,
          rating: null,
          subtitle: null,
          description: null,
          website: null,
          city: dto.city ?? null,
        }
      : undefined;

  return {
    listingId: dto.id,
    listingType: "company",
    companyId: (companyId || 0) as CompanyId,
    title: dto.title,
    area: dto.area ?? null,
    city: dto.city ?? null,
    address: "address" in dto ? dto.address ?? null : null,
    lat: dto.latitude ?? null,
    lng: dto.longitude ?? null,
    dwellingType: dto.dwellingType ?? null,
    rooms: dto.rooms ?? null,
    sizeM2: dto.sizeM2 ?? null,
    rent: dto.rent ?? null,
    moveIn: dto.moveIn ?? null,
    applyBy: dto.applyBy ?? null,
    availableFrom: dto.availableFrom ?? null,
    availableTo: null,
    description: "description" in dto ? dto.description ?? null : null,
    tags: dto.tags ?? [],
    images: toListingImages(dto),
    status: "available",
    createdAt: now,
    updatedAt: now,
    advertiser,
  };
};

const mapSchoolDto = (dto: ApiSchoolDto): School => ({
  schoolId: dto.id,
  schoolName: dto.name,
  city: dto.city ?? null,
  lat: dto.latitude ?? null,
  lng: dto.longitude ?? null,
});

const mapInterestDto = (dto: ApiInterestDto): UserInterest | null => {
  if (!dto.listingId) return null;
  return {
    listingId: dto.listingId,
    title: dto.title,
    city: dto.city,
    rent: dto.rent,
    primaryImageUrl: dto.primaryImageUrl,
    companyName: dto.companyName,
    createdAt: dto.createdAt,
  };
};

const mapQueueCompany = (company?: ApiQueueCompanyDto | null): CompanyAccount | undefined => {
  if (!company) return undefined;
  const now = new Date().toISOString();
  return {
    companyId: company.id,
    type: "company",
    email: "",
    passwordHash: "",
    createdAt: now,
    phone: null,
    logoUrl: company.logoUrl ?? null,
    bannerUrl: company.bannerUrl ?? null,
    tags: company.tags ?? null,
    settings: null,
    name: company.name,
    orgNumber: null,
    city: company.city ?? null,
    website: company.website ?? null,
    rating: company.rating ?? null,
    subtitle: company.subtitle ?? null,
    description: company.description ?? null,
    contactEmail: null,
    contactPhone: null,
    contactNote: null,
    verified: Boolean(company.verified),
  };
};

const mapQueueDto = (dto: ApiQueueDto): HousingQueueWithRelations => {
  const now = dto.updatedAt ?? new Date().toISOString();
  return {
    queueId: dto.id,
    companyId: dto.companyId as CompanyId,
    name: dto.name,
    area: dto.area ?? null,
    city: dto.city ?? null,
    lat: dto.latitude ?? null,
    lng: dto.longitude ?? null,
    description: dto.description ?? null,
    status: (dto.status as QueueStatus) ?? "open",
    totalUnits: dto.totalUnits ?? null,
    feeInfo: dto.feeInfo ?? null,
    contactEmail: dto.contactEmail ?? null,
    contactPhone: dto.contactPhone ?? null,
    website: dto.website ?? null,
    tags: dto.tags ?? [],
    approximateWaitDays: dto.approximateWaitDays ?? null,
    createdAt: now,
    updatedAt: now,
    company: mapQueueCompany(dto.company),
  };
};

// ---------- Auth ----------

export async function fetchCurrentUser(token: string): Promise<User> {
  const user = await apiFetch<ApiUserResponse>("/api/auth/me", {}, token);
  return mapUserResponse(user);
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const res = await apiFetch<ApiLoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return { accessToken: res.accessToken, user: mapUserResponse(res.user) };
}

type RegisterUserPayload = {
  type: UserType | string;
  ssn: string;
  email: string;
  password: string;
};

export async function registerUser(payload: RegisterUserPayload): Promise<User> {
  const user = await apiFetch<ApiUserResponse>("/api/users/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapUserResponse(user);
}

export async function setCurrentUserSchool(
  schoolId: number,
  token: string
): Promise<User> {
  const user = await apiFetch<ApiUserResponse>(
    `/api/users/me/school${buildQuery({ schoolId })}`,
    { method: "PUT" },
    token
  );
  return mapUserResponse(user);
}

// ---------- Listings ----------

export type ListListingsParams = {
  q?: string;
  city?: string;
  minRent?: number;
  maxRent?: number;
  page?: number;
  size?: number;
  secure?: boolean;
};

export async function listListings(
  params?: ListListingsParams,
  token?: string
): Promise<PaginatedResult<ListingWithRelations>> {
  const secure = params?.secure ?? Boolean(token);
  const endpoint = secure ? "/api/listings/secure" : "/api/listings";
  const query = buildQuery({
    q: params?.q,
    city: params?.city,
    minRent: params?.minRent,
    maxRent: params?.maxRent,
    page: params?.page,
    size: params?.size,
  });

  const res = await apiFetch<ApiListingSearchResponse<ApiListingPublicDto | ApiListingPrivateDto>>(
    `${endpoint}${query}`,
    {},
    token
  );

  return {
    ...res,
    items: res.items.map(mapListingDto),
  };
}

export type FetchListingOptions = { secure?: boolean; token?: string };

export async function fetchListing(
  listingId: string,
  options: FetchListingOptions = {}
): Promise<ListingWithRelations> {
  const secure = options.secure ?? Boolean(options.token);
  const endpoint = secure ? `/api/listings/${listingId}/secure` : `/api/listings/${listingId}`;
  const dto = await apiFetch<ApiListingPublicDto | ApiListingPrivateDto>(
    endpoint,
    {},
    options.token
  );
  return mapListingDto(dto);
}

export async function registerInterestForListing(
  listingId: string,
  token: string
): Promise<void> {
  await apiFetch<void>(`/api/listings/${listingId}/interest`, { method: "POST" }, token);
}

export async function fetchListingActivities(
  listingId: string,
  radiusKm = 1.5
): Promise<ListingActivity[]> {
  return apiFetch<ApiActivityDto[]>(
    `/api/listings/${listingId}/activities${buildQuery({ radiusKm })}`
  );
}

// ---------- Interests ----------

export async function fetchMyInterests(token: string): Promise<UserInterest[]> {
  const res = await apiFetch<ApiInterestDto[]>("/api/interests/me", {}, token);
  return res.map(mapInterestDto).filter(Boolean) as UserInterest[];
}

// ---------- Schools ----------

export async function fetchSchools(q?: string): Promise<School[]> {
  const res = await apiFetch<ApiSchoolDto[]>(`/api/schools${buildQuery({ q })}`);
  return res.map(mapSchoolDto);
}

export async function fetchListingsNearSchool(
  schoolId: number,
  radiusKm = 10,
  size = 12
): Promise<ListingWithRelations[]> {
  const res = await apiFetch<{ items: ApiListingPublicDto[] }>(
    `/api/schools/${schoolId}/listings${buildQuery({ radiusKm, size })}`
  );
  return (res.items ?? []).map(mapListingDto);
}

export async function fetchQueuesForSchool(
  schoolId: number,
  radiusKm = 10
): Promise<SchoolQueueSummary[]> {
  return apiFetch<ApiSchoolQueueDto[]>(
    `/api/schools/${schoolId}/queues${buildQuery({ radiusKm })}`
  );
}

// ---------- Queues ----------

export async function fetchQueues(): Promise<HousingQueueWithRelations[]> {
  const res = await apiFetch<ApiQueueDto[]>("/api/queues");
  return res.map(mapQueueDto);
}

export async function fetchQueue(queueId: string): Promise<HousingQueueWithRelations> {
  const res = await apiFetch<ApiQueueDto>(`/api/queues/${queueId}`);
  return mapQueueDto(res);
}

export async function joinQueue(companyId: number, token: string): Promise<void> {
  await apiFetch<void>(
    `/api/queues/join${buildQuery({ companyId })}`,
    { method: "POST" },
    token
  );
}

export async function joinAllQueues(
  token: string,
  options?: { schoolId?: number; radiusKm?: number }
): Promise<QueueEntry[]> {
  const query = buildQuery({
    schoolId: options?.schoolId,
    radiusKm: options?.radiusKm ?? 10,
  });
  return apiFetch<ApiQueueEntryDto[]>(`/api/queues/join-all${query}`, { method: "POST" }, token);
}

export async function exitQueue(companyId: number, token: string): Promise<void> {
  await apiFetch<void>(
    `/api/queues/exit${buildQuery({ companyId })}`,
    { method: "DELETE" },
    token
  );
}

export async function fetchMyQueues(token: string): Promise<QueueEntry[]> {
  return apiFetch<ApiQueueEntryDto[]>("/api/queues/me", {}, token);
}

// ---------- Ads ----------

export type RollingAd = {
  id?: number | string;
  company?: string;
  data?: unknown;
};

export async function fetchCurrentAds(token?: string): Promise<RollingAd[]> {
  const ads = await apiFetch<RawAd[]>("/api/ads/current", {}, token);
  return ads.map((ad) => ({
    id: ad.id,
    company: ad.company,
    data: ad.data,
  }));
}

// ---------- Aggregated export ----------

export const backendApi = {
  auth: {
    me: fetchCurrentUser,
    login: loginUser,
    register: registerUser,
    setSchool: setCurrentUserSchool,
  },
  listings: {
    list: listListings,
    get: fetchListing,
    interest: registerInterestForListing,
    activities: fetchListingActivities,
  },
  interests: {
    mine: fetchMyInterests,
  },
  schools: {
    list: fetchSchools,
    listingsNear: fetchListingsNearSchool,
    queues: fetchQueuesForSchool,
  },
  queues: {
    list: fetchQueues,
    get: fetchQueue,
    join: joinQueue,
    joinAll: joinAllQueues,
    exit: exitQueue,
    mine: fetchMyQueues,
  },
  ads: {
    current: fetchCurrentAds,
  },
};
