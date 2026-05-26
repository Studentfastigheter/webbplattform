export const normalizeApiBase = (value: string): string => {
  const trimmed = value.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL saknas. Satt den i .env.local och i Vercel.");
}

export const API_BASE = normalizeApiBase(apiUrl);

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

const STATUS_MESSAGES: Record<number, string> = {
  400: "Ogiltig förfrågan. Kontrollera fälten och försök igen.",
  401: "Du måste vara inloggad för att göra detta.",
  403: "Du har inte behörighet att göra detta.",
  404: "Vi kunde inte hitta det du söker.",
  409: "Uppgifterna används redan.",
  422: "Vissa fält saknas eller är felaktiga.",
  429: "För många försök, vänta en stund och prova igen.",
  500: "Serverfel. Försök igen om en liten stund.",
  503: "Tjänsten är tillfälligt nere. Försök igen snart.",
};

type QueryValue =
  | string
  | number
  | boolean
  | Array<string | number | boolean>
  | undefined
  | null;

type ApiClientOptions = RequestInit & {
  auth?: boolean;
  responseType?: "json" | "text" | "blob";
};

const READ_DEDUPE_CACHE_MS = 1000;
const inFlightReadRequests = new Map<string, Promise<unknown>>();
const completedReadRequests = new Map<
  string,
  { value: unknown; expiresAt: number }
>();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function cloneApiResult<T>(value: T): T {
  if (value === null || value === undefined || typeof value !== "object") {
    return value;
  }

  if (typeof structuredClone === "function") {
    try {
      return structuredClone(value);
    } catch {
      // Fall through to JSON clone for plain API payloads.
    }
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

function createReadRequestKey(
  method: string,
  url: string,
  headers: Record<string, string>,
  responseType: ApiClientOptions["responseType"]
): string {
  const headerKey = Object.entries(headers)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}:${value}`)
    .join("|");

  return `${method} ${url} ${responseType ?? "json"} ${headerKey}`;
}

export function arrayFromApiResponse<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (!isRecord(value)) {
    return [];
  }

  for (const key of ["content", "items", "data", "results"]) {
    const nested = value[key];
    if (Array.isArray(nested)) {
      return nested as T[];
    }
  }

  return [];
}

export function normalizeAuthToken(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") {
    return null;
  }

  return trimmed.replace(/^Bearer\s+/i, "").trim() || null;
}

export function buildQuery(params: Record<string, QueryValue>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (String(item).length > 0) {
          search.append(key, String(item));
        }
      });
      return;
    }

    if (value !== undefined && value !== null && String(value).length > 0) {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function pathSegment(value: string | number | boolean): string {
  return encodeURIComponent(String(value));
}

export async function apiClient<T>(
  endpoint: string,
  {
    headers,
    auth = true,
    responseType = "json",
    ...customOptions
  }: ApiClientOptions = {},
  token?: string | null
): Promise<T> {
  const hasBody =
    customOptions.body !== undefined && customOptions.body !== null;
  const isFormDataBody =
    typeof FormData !== "undefined" && customOptions.body instanceof FormData;

  const defaultHeaders: Record<string, string> = {
    ...(hasBody && !isFormDataBody ? { "Content-Type": "application/json" } : {}),
    ...(headers as Record<string, string>),
  };

  // 1. Automatisk Token-hantering
  let authToken = normalizeAuthToken(token);
  if (!authToken && auth !== false && typeof window !== "undefined") {
    const stored = localStorage.getItem("token");
    authToken = normalizeAuthToken(stored);
  }

  // Vi kollar så att authToken inte är strängen "null" eller "undefined"
  if (authToken) {
    defaultHeaders.Authorization = `Bearer ${authToken}`;
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const url = `${API_BASE}/${cleanEndpoint}`;
  const method = (customOptions.method ?? "GET").toUpperCase();

  const request = async (): Promise<T> => {
    let res: Response;
    try {
      res = await fetch(url, {
        ...customOptions,
        headers: defaultHeaders,
        cache: customOptions.cache ?? "no-store",
      });
    } catch (err) {
      throw new Error((err as Error)?.message || "Kunde inte nå servern.");
    }

    if (res.status === 204) {
      return {} as T;
    }

    if (responseType === "blob" && res.ok) {
      return (await res.blob()) as T;
    }

    const rawBody = await res.text().catch(() => "");
    let parsed: any = undefined;

    if (rawBody) {
      try {
        parsed = JSON.parse(rawBody);
      } catch {
        parsed = rawBody;
      }
    }

    if (!res.ok) {
      // Om token var ogiltig (401), rensa den direkt så vi slipper problem vid nästa laddning
      if (res.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("token");
      }

      const message =
        parsed?.message ||
        parsed?.error ||
        (typeof parsed === "string" ? parsed : null) ||
        STATUS_MESSAGES[res.status] ||
        res.statusText ||
        `Något gick fel (${res.status}).`;

      throw new ApiError(String(message), res.status, parsed);
    }

    if (!rawBody) return undefined as T;
    if (responseType === "text") return rawBody as T;
    return parsed as T;
  };

  const shouldDedupeRead =
    method === "GET" && !hasBody && customOptions.signal === undefined;

  if (!shouldDedupeRead) {
    if (method !== "GET") {
      completedReadRequests.clear();
    }

    return request();
  }

  const requestKey = createReadRequestKey(method, url, defaultHeaders, responseType);
  const completedRequest = completedReadRequests.get(requestKey);

  if (completedRequest) {
    if (completedRequest.expiresAt > Date.now()) {
      return cloneApiResult(completedRequest.value as T);
    }

    completedReadRequests.delete(requestKey);
  }

  const inFlightRequest = inFlightReadRequests.get(requestKey);

  if (inFlightRequest) {
    return cloneApiResult((await inFlightRequest) as T);
  }

  const readRequest = request();
  inFlightReadRequests.set(requestKey, readRequest);

  try {
    const result = await readRequest;
    completedReadRequests.set(requestKey, {
      value: result,
      expiresAt: Date.now() + READ_DEDUPE_CACHE_MS,
    });

    return cloneApiResult(result);
  } finally {
    if (inFlightReadRequests.get(requestKey) === readRequest) {
      inFlightReadRequests.delete(requestKey);
    }
  }
}
