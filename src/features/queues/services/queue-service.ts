import {
  apiClient,
  arrayFromApiResponse,
  buildQuery,
  pathSegment,
  type ServiceOptions,
} from "@/lib/api/client";
import {
  firstFiniteNumber as firstNumber,
  firstNonEmptyString as firstString,
  isRecord,
} from "@/lib/api/normalize";
import { normalizeListingCards } from "@/features/listings/services/listing-service";
import { HousingQueueDTO } from "@/types/queue";
import { ListingCardDTO, type PageResponse } from "@/types/listing";

export interface CompanyDTO {
  id?: number;
  companyId?: number;
  name?: string;
  companyName?: string;
  subtitle?: string | null;
  description?: string | null;
  website?: string | null;
  websiteUrl?: string | null;
  rating?: number | null;
  verified?: boolean | null;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  housingQueueId?: string | null;
  termsUrl?: string | null;
  privacyUrl?: string | null;
  privacyPolicyUrl?: string | null;
  pictureUrlList?: string[];
  videoUrlList?: string[];
  socialLinks?: Record<string, string>;
  cities?: string[];
  schools?: Array<{
    id?: number;
    schoolId?: number;
    name?: string;
    city?: string | null;
    lat?: number | null;
    lng?: number | null;
  }>;
};

export type QueueFilters = {
  id?: string | null;          // Queue id, TODO: This should probably change (JaarmaCo@git)
  city?: string | null;        // City the queues should be in.
  pageNumber?: number;         // Page number to get.
  pageSize?: number;           // Number of entries in a page.
  pageCount?: number;          // Number of pages to fetch.
};

export type QueueApplicationDTO = {
  id?: string | number;
  queueId?: string | number;
  queueName?: string;
  queue?: (Partial<HousingQueueDTO> & {
    id?: string | number;
    name?: string;
    area?: string | null;
    city?: string | null;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    description?: string | null;
    status?: string | null;
    totalUnits?: number | null;
    approximateWaitDays?: number | null;
    company?: {
      id?: number;
      name?: string;
      logoUrl?: string | null;
      bannerUrl?: string | null;
      city?: string | null;
    } | null;
  });
  studentId?: number;
  firstName?: string;
  surname?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  joinedAt?: string;
  createdAt?: string;
  status?: string;
  queueDays?: number;
  daysInQueue?: number;
  position?: number;
};

export type CreateHousingQueueRequirementRequest = {
  requirement: string;
};

export type QueueApplicationTrendGranularity = "day" | "week" | "month";

export type QueueApplicationTrendDTO = {
  bucket?: string;
  date?: string;
  period?: string;
  count?: number;
  value?: number;
  total?: number;
};

type MyQueuesResponse =
  | QueueApplicationDTO
  | QueueApplicationDTO[]
  | {
      content?: QueueApplicationDTO[];
      data?: QueueApplicationDTO[];
      queues?: QueueApplicationDTO[];
      memberships?: QueueApplicationDTO[];
      queueMemberships?: QueueApplicationDTO[];
    };

const queueEndpoints = {
  list: (query: Record<string, any>) => `/queues${buildQuery(query)}`,
  all: () => "/queues/all",
  detail: (id: string) => `/queues/${pathSegment(id)}`,
  my: () => "/queues/my",
  join: (queueId: string) => `/queues/${pathSegment(queueId)}/join`,
  leave: (queueId: string) => `/queues/${pathSegment(queueId)}/leave`,
  requirement: (id: string) => `/queues/${pathSegment(id)}/requirement`,
} as const;

export function getQueueApplicationQueueId(
  application: QueueApplicationDTO
): string | null {
  const queueId = application.queueId ?? application.queue?.id;
  return queueId != null ? String(queueId) : null;
}

export function buildJoinedQueueIdSet(
  applications: QueueApplicationDTO[]
): Set<string> {
  return new Set(
    applications
      .map(getQueueApplicationQueueId)
      .filter((queueId): queueId is string => Boolean(queueId))
  );
}

function readEmbeddedQueueApplications(queue: HousingQueueDTO): QueueApplicationDTO[] {
  const rawQueue = queue as HousingQueueDTO & Record<string, unknown>;
  const candidates = [
    rawQueue.queueApplications,
    rawQueue.applications,
    rawQueue.students,
    rawQueue.members,
  ];
  const embedded = candidates.find(Array.isArray);

  if (!embedded) {
    return [];
  }

  return embedded
    .filter((application): application is QueueApplicationDTO => (
      typeof application === "object" && application !== null
    ))
    .map((application) => ({
      ...application,
      queueId: application.queueId ?? queue.id,
      queueName: application.queueName ?? queue.name,
    }));
}

const DEFAULT_PAGE_SIZE = 12;

function getQueueDays(row: QueueApplicationDTO): number {
  if (typeof row.queueDays === "number") return row.queueDays;
  if (typeof row.daysInQueue === "number") return row.daysInQueue;

  const joinedAt = row.joinedAt ?? row.createdAt;
  if (!joinedAt) return 0;

  const joinedDate = new Date(joinedAt);
  if (Number.isNaN(joinedDate.getTime())) return 0;

  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.floor((Date.now() - joinedDate.getTime()) / millisecondsPerDay));
}

function getMyQueuesRows(res: MyQueuesResponse): QueueApplicationDTO[] {
  if (Array.isArray(res)) return res;
  if (!res || typeof res !== "object") return [];

  const wrappedRows =
    "content" in res && Array.isArray(res.content)
      ? res.content
      : "data" in res && Array.isArray(res.data)
      ? res.data
      : "queues" in res && Array.isArray(res.queues)
      ? res.queues
      : "memberships" in res && Array.isArray(res.memberships)
      ? res.memberships
      : "queueMemberships" in res && Array.isArray(res.queueMemberships)
      ? res.queueMemberships
      : null;

  if (wrappedRows) return wrappedRows;

  return "queue" in res || "queueId" in res ? [res as QueueApplicationDTO] : [];
}

function normalizeListingPageResponse(
  res: unknown,
  page: number,
  size: number
): PageResponse<ListingCardDTO> {
  const raw = res as any;
  const content = normalizeListingCards(
    Array.isArray(res) ? res : arrayFromApiResponse<unknown>(res)
  );

  if (Array.isArray(res)) {
    return {
      content,
      totalPages: 1,
      totalElements: content.length,
      numberOfElements: content.length,
      size,
      number: page,
      first: true,
      last: true,
      empty: content.length === 0,
    };
  }

  const totalElements =
    raw?.totalElements ?? raw?.page?.totalElements ?? content.length;
  const totalPages =
    raw?.totalPages ??
    raw?.page?.totalPages ??
    Math.max(1, Math.ceil(totalElements / size));

  return {
    ...raw,
    content,
    totalPages,
    totalElements,
    numberOfElements: raw?.numberOfElements ?? content.length,
    size: raw?.size ?? raw?.page?.size ?? size,
    number: raw?.number ?? raw?.page?.number ?? page,
    first: raw?.first ?? page <= 0,
    last: raw?.last ?? page >= totalPages - 1,
    empty: raw?.empty ?? content.length === 0,
  };
}

function normalizeHousingQueue(value: unknown): HousingQueueDTO {
  const source = value as HousingQueueDTO & Record<string, unknown>;
  const company = isRecord(source.company) ? source.company : null;
  const companyLogoUrl = firstString(
    source.companyLogoUrl,
    company?.logoUrl,
    source.logoUrl
  );

  return {
    ...source,
    companyLogoUrl: companyLogoUrl ?? source.companyLogoUrl ?? null,
    logoUrl: firstString(source.logoUrl, companyLogoUrl) ?? null,
  };
}

function normalizeStringRecord(value: unknown): Record<string, string> | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const entries = Object.entries(value)
    .map(([key, entryValue]) => [
      key,
      typeof entryValue === "string" ? entryValue : undefined,
    ] as const)
    .filter((entry): entry is readonly [string, string] => entry[1] !== undefined);

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

function normalizeCompanyDto(value: unknown): CompanyDTO {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const source = value as Record<string, unknown>;

  return {
    ...(source as Partial<CompanyDTO>),
    id: firstNumber(source.id, source.companyId),
    companyId: firstNumber(source.companyId, source.id),
    name: firstString(source.name, source.companyName),
    companyName: firstString(source.companyName, source.name),
    description: firstString(
      source.description,
      source.companyDescription,
      source.bio,
      source.companyBio,
      source.about,
      source.aboutText
    ),
    website: firstString(source.website, source.websiteUrl),
    websiteUrl: firstString(source.websiteUrl, source.website),
    termsUrl: firstString(source.termsUrl),
    privacyUrl: firstString(source.privacyUrl, source.privacyPolicyUrl, source.policyUrl),
    privacyPolicyUrl: firstString(source.privacyPolicyUrl, source.privacyUrl, source.policyUrl),
    cities: arrayFromApiResponse<string>(source.cities ?? source.companyCities),
    schools: arrayFromApiResponse<NonNullable<CompanyDTO["schools"]>[number]>(
      source.schools ?? source.companySchools
    ),
    pictureUrlList: arrayFromApiResponse<string>(
      source.pictureUrlList ?? source.companyPictures
    ),
    videoUrlList: arrayFromApiResponse<string>(
      source.videoUrlList ?? source.companyVideos
    ),
    socialLinks: normalizeStringRecord(source.socialLinks),
  };
}

export const queueService = {

  list: async (
    {
      id = null,
      city = null,
      pageNumber = 1,
      pageSize = DEFAULT_PAGE_SIZE,
      pageCount = 1,
    }: QueueFilters = {},
    options?: ServiceOptions
  ): Promise<HousingQueueDTO[]> => {
    const normalizedPageNumber = Math.max(1, pageNumber);
    const normalizedPageSize = Math.max(1, pageSize);
    const normalizedPageCount = Math.max(1, pageCount);
    const drop = normalizedPageSize * (normalizedPageNumber - 1);
    const take = normalizedPageSize * normalizedPageCount;
    const query: Record<string, any> = {
      drop: drop,
      take: take,
    };
    if (id !== null) {
      query.id = id;
    }
    if (city !== null) {
      query.city = city;
    }
    const queues = await apiClient<unknown>(queueEndpoints.list(query), {
      auth: false,
      signal: options?.signal,
    });
    return arrayFromApiResponse<unknown>(queues).map(normalizeHousingQueue);
  },

  getAll: async (options?: ServiceOptions): Promise<HousingQueueDTO[]> => {
    const queues = await apiClient<unknown>(queueEndpoints.all(), {
      auth: false,
      signal: options?.signal,
    });
    return arrayFromApiResponse<unknown>(queues).map(normalizeHousingQueue);
  },

  get: async (
    id: string,
    options?: ServiceOptions
  ): Promise<HousingQueueDTO> => {
    const queue = await apiClient<unknown>(queueEndpoints.detail(id), {
      auth: false,
      signal: options?.signal,
    });
    return normalizeHousingQueue(queue);
  },

  getByCompany: async (
    companyId: number,
    options?: ServiceOptions
  ): Promise<HousingQueueDTO[]> => {
    const queues = await apiClient<unknown>(
      `/companies/${pathSegment(companyId)}/queues`,
      { auth: false, signal: options?.signal }
    );
    return arrayFromApiResponse<unknown>(queues).map(normalizeHousingQueue);
  },

  join: async (queueId: string): Promise<string> => {
    return apiClient<string>(queueEndpoints.join(queueId), {
      method: "POST",
      responseType: "text",
    });
  },

  // Lämna en kö (studenten tar bort sitt medlemskap).
  // Anropar: DELETE /api/queues/{id}/leave
  leave: async (queueId: string): Promise<void> => {
    await apiClient<void>(queueEndpoints.leave(queueId), {
      method: "DELETE",
    });
  },

  upsertRequirement: async (
    queueId: string,
    request: CreateHousingQueueRequirementRequest | string
  ): Promise<void> => {
    await apiClient<void>(queueEndpoints.requirement(queueId), {
      method: "POST",
      body: JSON.stringify(
        typeof request === "string" ? { requirement: request } : request
      ),
    });
  },

  getMyQueues: async (
    options: { hydrateQueues?: boolean; signal?: AbortSignal } = {}
  ): Promise<QueueApplicationDTO[]> => {
    const res = await apiClient<MyQueuesResponse>(queueEndpoints.my(), {
      signal: options.signal,
    });
    const rows = getMyQueuesRows(res);
    if (options.hydrateQueues === false) {
      return rows.map((row) => {
        const queueId = row.queueId ?? row.queue?.id;
        return {
          ...row,
          queueId: queueId != null ? String(queueId) : queueId,
          queueName: row.queueName ?? row.queue?.name,
          queueDays: getQueueDays(row),
        };
      });
    }

    const queueIds = Array.from(
      new Set(
        rows
          .map(getQueueApplicationQueueId)
          .filter((queueId): queueId is string => Boolean(queueId))
      )
    );
    const queueDetails = await Promise.all(
      queueIds.map(async (queueId) => {
        const queue = await queueService.get(queueId).catch(() => null);
        return [queueId, queue] as const;
      })
    );
    const queuesById = new Map(
      queueDetails.filter(
        (entry): entry is readonly [string, HousingQueueDTO] => entry[1] !== null
      )
    );

    return rows.map((row) => {
      const queueId = row.queueId ?? row.queue?.id;
      const normalizedQueueId = queueId != null ? String(queueId) : queueId;
      const queue = normalizedQueueId ? queuesById.get(normalizedQueueId) : undefined;
      const embeddedQueue = row.queue;
      const queueName = row.queueName ?? row.queue?.name ?? queue?.name;
      const mergedQueue =
        queue || embeddedQueue
          ? normalizeHousingQueue({
              ...(queue ?? {}),
              ...(embeddedQueue ?? {}),
              companyLogoUrl:
                embeddedQueue?.companyLogoUrl ??
                queue?.companyLogoUrl ??
                embeddedQueue?.company?.logoUrl ??
                embeddedQueue?.logoUrl ??
                queue?.logoUrl,
              logoUrl:
                embeddedQueue?.logoUrl ??
                embeddedQueue?.companyLogoUrl ??
                queue?.logoUrl ??
                queue?.companyLogoUrl ??
                embeddedQueue?.company?.logoUrl,
            })
          : undefined;

      return {
        ...row,
        queueId: normalizedQueueId,
        queueName,
        queue: mergedQueue,
        queueDays: getQueueDays(row),
      };
    });
  },

  getCompany: async (
    companyId: number,
    options?: ServiceOptions
  ): Promise<CompanyDTO> => {
    const company = await apiClient<unknown>(`/companies/${pathSegment(companyId)}`, {
      auth: false,
      signal: options?.signal,
    });
    return normalizeCompanyDto(company);
  },

  getCompanyListingsPage: async (
    companyId: number,
    page = 0,
    size = 12,
    options?: ServiceOptions
  ): Promise<PageResponse<ListingCardDTO>> => {
    const query = buildQuery({ page, size });
    const res = await apiClient<unknown>(
      `/companies/${pathSegment(companyId)}/listings${query}`,
      { auth: false, signal: options?.signal }
    );

    return normalizeListingPageResponse(res, page, size);
  },

  getCompanyListings: async (
    companyId: number,
    page = 0,
    size = 12,
    options?: ServiceOptions
  ): Promise<ListingCardDTO[]> => {
    const res = await queueService.getCompanyListingsPage(
      companyId,
      page,
      size,
      options
    );
    return res.content ?? [];
  },

  getAllCompanyListingsPage: async (
    companyId: number,
    page = 0,
    size = 12,
    options?: ServiceOptions
  ): Promise<PageResponse<ListingCardDTO>> => {
    const query = buildQuery({ page, size });
    const res = await apiClient<unknown>(
      `/companies/${pathSegment(companyId)}/all-listings${query}`,
      { signal: options?.signal }
    );

    return normalizeListingPageResponse(res, page, size);
  },

  getAllCompanyListings: async (
    companyId: number,
    page = 0,
    size = 12,
    options?: ServiceOptions
  ): Promise<ListingCardDTO[]> => {
    const res = await queueService.getAllCompanyListingsPage(
      companyId,
      page,
      size,
      options
    );
    return res.content ?? [];
  },

  getCompanyQueueApplications: async (
    companyId: number,
    options?: ServiceOptions
  ): Promise<QueueApplicationDTO[]> => {
    const queues = await queueService
      .getByCompany(companyId, options)
      .catch(() => []);
    const queueApplications = await Promise.all(
      queues.map(async (queue) => {
        const embeddedApplications = readEmbeddedQueueApplications(queue);
        if (embeddedApplications.length > 0) {
          return embeddedApplications;
        }

        return [];
      })
    );

    return queueApplications.flat();
  },

  getCompanyQueueApplicationsCount: async (
    companyId: number,
    options?: ServiceOptions
  ): Promise<number> => {
    const result = await apiClient<unknown>(
      `/companies/${pathSegment(companyId)}/queues/applications/count`,
      { signal: options?.signal }
    );
    const count = Number(result);
    return Number.isFinite(count) ? count : 0;
  },

  getCompanyQueueApplicationsTrend: async (
    companyId: number,
    options: {
      from?: string | Date;
      to?: string | Date;
      granularity?: QueueApplicationTrendGranularity;
      signal?: AbortSignal;
    } = {}
  ): Promise<QueueApplicationTrendDTO[]> => {
    const query = buildQuery({
      from: options.from instanceof Date ? options.from.toISOString() : options.from,
      to: options.to instanceof Date ? options.to.toISOString() : options.to,
      granularity: options.granularity ?? "day",
    });
    const result = await apiClient<unknown>(
      `/companies/${pathSegment(companyId)}/queues/applications/trend${query}`,
      { signal: options.signal }
    );

    return arrayFromApiResponse<QueueApplicationTrendDTO>(result);
  },
};
