import {
  apiClient,
  arrayFromApiResponse,
  buildQuery,
  pathSegment,
} from "@/lib/api/client";
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
  socialLinks?: unknown[];
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

function firstString(...values: unknown[]): string | undefined {
  return values.find(
    (value): value is string => typeof value === "string" && value.trim().length > 0
  )?.trim();
}

function firstNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    const numberValue =
      typeof value === "string" ? Number(value.replace(",", ".")) : Number(value);

    if (Number.isFinite(numberValue)) {
      return numberValue;
    }
  }

  return undefined;
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
    website: firstString(source.website, source.websiteUrl),
    websiteUrl: firstString(source.websiteUrl, source.website),
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
  };
}

export const queueService = {

  list: async ({ id         = null,
                 city       = null,
                 pageNumber = 1,
                 pageSize   = DEFAULT_PAGE_SIZE,
                 pageCount  = 1,
               }: QueueFilters = {}): Promise<HousingQueueDTO[]> => {
    const normalizedPageNumber = Math.max(1, pageNumber);
    const normalizedPageSize = Math.max(1, pageSize);
    const drop = normalizedPageSize * (normalizedPageNumber - 1);
    const take = normalizedPageSize;
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
    const request = `/queues${buildQuery(query)}`;
    const queues = await apiClient<unknown>(request, { auth: false });
    return arrayFromApiResponse<HousingQueueDTO>(queues);
  },

  getAll: async (): Promise<HousingQueueDTO[]> => {
    const queues = await apiClient<unknown>("/queues/all", { auth: false });
    return arrayFromApiResponse<HousingQueueDTO>(queues);
  },

  get: async (id: string): Promise<HousingQueueDTO> => {
    return await apiClient<HousingQueueDTO>(`/queues/${pathSegment(id)}`, {
      auth: false,
    });
  },

  getByCompany: async (companyId: number): Promise<HousingQueueDTO[]> => {
    const queues = await apiClient<unknown>(
      `/companies/${pathSegment(companyId)}/queues`,
      { auth: false }
    );
    return arrayFromApiResponse<HousingQueueDTO>(queues);
  },

  join: async (queueId: string): Promise<string> => {
    // Vi förväntar oss text/plain svar från backend
    return apiClient<string>(`/queues/${pathSegment(queueId)}/join`, {
      method: "POST"
    });
  },

  getMyQueues: async (
    options: { hydrateQueues?: boolean } = {}
  ): Promise<QueueApplicationDTO[]> => {
    const res = await apiClient<MyQueuesResponse>("/queues/my");
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
      const queueName = row.queueName ?? row.queue?.name ?? queue?.name;

      return {
        ...row,
        queueId: normalizedQueueId,
        queueName,
        queue: row.queue ?? queue,
        queueDays: getQueueDays(row),
      };
    });
  },

  getCompany: async (companyId: number): Promise<CompanyDTO> => {
    const company = await apiClient<unknown>(`/companies/${pathSegment(companyId)}`, {
      auth: false,
    });
    return normalizeCompanyDto(company);
  },

  getCompanyListingsPage: async (
    companyId: number,
    page = 0,
    size = 12,
  ): Promise<PageResponse<ListingCardDTO>> => {
    const query = buildQuery({ page, size });
    const res = await apiClient<unknown>(
      `/companies/${pathSegment(companyId)}/listings${query}`,
      { auth: false }
    );

    return normalizeListingPageResponse(res, page, size);
  },

  getCompanyListings: async (companyId: number, page = 0, size = 12): Promise<ListingCardDTO[]> => {
    const res = await queueService.getCompanyListingsPage(companyId, page, size);
    return res.content ?? [];
  },

  getAllCompanyListingsPage: async (
    companyId: number,
    page = 0,
    size = 12,
  ): Promise<PageResponse<ListingCardDTO>> => {
    const query = buildQuery({ page, size });
    const res = await apiClient<unknown>(
      `/companies/${pathSegment(companyId)}/all-listings${query}`
    );

    return normalizeListingPageResponse(res, page, size);
  },

  getAllCompanyListings: async (
    companyId: number,
    page = 0,
    size = 12
  ): Promise<ListingCardDTO[]> => {
    const res = await queueService.getAllCompanyListingsPage(companyId, page, size);
    return res.content ?? [];
  },

  getCompanyQueueApplications: async (companyId: number): Promise<QueueApplicationDTO[]> => {
    const queues = await queueService.getByCompany(companyId).catch(() => []);
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
};
