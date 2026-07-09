import { decodeRichText, decodeRichTextPayload } from "@/lib/rich-text";
import { getStoredAuthToken, setStoredAuthToken } from "@/lib/auth-storage";
import {
  getLocaleFromCookieValue,
  getLocaleFromPathname,
  localeCookieName,
  type Locale,
} from "@/i18n/config";

/**
 * The backend mirrors the Hogia public APIs: the Accept-Language header
 * (sv-SE default, en-GB) selects the language of every localizable string in
 * a response. Resolved per request so every backend call carries the active
 * site language — client-side from the /en path prefix or the locale cookie,
 * server-side from the x-campuslyan-locale header the proxy stamps on the
 * page request (read lazily via next/headers so this module stays isomorphic).
 */
const toAcceptLanguage = (locale: Locale | null | undefined) =>
  locale === "en" ? "en-GB" : "sv-SE";

const readClientLocaleCookie = (): Locale | null => {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${localeCookieName}=([^;]*)`)
  );
  return match ? getLocaleFromCookieValue(decodeURIComponent(match[1])) : null;
};

async function resolveAcceptLanguage(): Promise<string> {
  if (typeof window !== "undefined") {
    const locale =
      getLocaleFromPathname(window.location.pathname) ?? readClientLocaleCookie();
    return toAcceptLanguage(locale);
  }

  try {
    const { headers } = await import("next/headers");
    const requestHeaders = await headers();
    const locale = getLocaleFromCookieValue(
      requestHeaders.get("x-campuslyan-locale")
    );
    return toAcceptLanguage(locale);
  } catch {
    // Outside a request scope (build-time, scripts): Swedish default.
    return toAcceptLanguage(null);
  }
}

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

/**
 * Standard shape every feature service should accept on its READ functions
 * once it's migrated to be called via a TanStack Query hook. TanStack Query
 * passes an `AbortSignal` to every `queryFn` via its context — services that
 * forward it into `apiClient({ signal })` get free cancellation when a query
 * is invalidated, the component unmounts, or a stale request is superseded.
 *
 * Usage pattern (added per-service in Phase 3, not in this commit):
 *   get: async (id: string, options?: ServiceOptions) =>
 *     apiClient<T>(`/listings/${id}`, { auth: false, signal: options?.signal })
 *
 * NOTE: the existing read-dedupe cache in this file deliberately skips
 * requests that carry a signal (see `shouldDedupeRead` below), so queries
 * that pass `signal` bypass the homegrown 1s cache and rely on TanStack
 * Query's cache instead. That's correct and intentional.
 */
export type ServiceOptions = {
  signal?: AbortSignal;
};

const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;

/**
 * Kombinerar anroparens ev. AbortSignal med en timeout så att en hängande
 * backend aldrig lämnar UI:t i evig laddning. Anroparens abort vinner alltid
 * (dess reason propageras); timeouten markeras med TimeoutError.
 */
function createRequestSignal(
  callerSignal: AbortSignal | null | undefined,
  timeoutMs: number
): { signal: AbortSignal; didTimeOut: () => boolean; cleanup: () => void } {
  const controller = new AbortController();
  let timedOut = false;

  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort(
      new DOMException("Request timed out", "TimeoutError")
    );
  }, timeoutMs);

  const onCallerAbort = () => {
    controller.abort(callerSignal?.reason);
  };

  if (callerSignal) {
    if (callerSignal.aborted) {
      onCallerAbort();
    } else {
      callerSignal.addEventListener("abort", onCallerAbort, { once: true });
    }
  }

  return {
    signal: controller.signal,
    didTimeOut: () => timedOut,
    // Rensar bara timeouten (när headers anlänt räknas servern som vid liv).
    // Abort-lyssnaren behålls så att anroparens avbrott fortfarande kan
    // avbryta body-läsningen; {once:true} städar den åt oss.
    cleanup: () => {
      clearTimeout(timeoutId);
    },
  };
}

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

  // (\s+|$) så att ett ensamt "Bearer" (t.ex. från "Bearer " som trimmats)
  // också blir null i stället för att returneras som token.
  return trimmed.replace(/^Bearer(\s+|$)/i, "").trim() || null;
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
    "Accept-Language": await resolveAcceptLanguage(),
    ...(hasBody && !isFormDataBody ? { "Content-Type": "application/json" } : {}),
    ...(headers as Record<string, string>),
  };

  // 1. Automatisk Token-hantering
  let authToken = normalizeAuthToken(token);
  if (!authToken && auth !== false && typeof window !== "undefined") {
    authToken = normalizeAuthToken(getStoredAuthToken());
  }

  // Vi kollar så att authToken inte är strängen "null" eller "undefined"
  if (authToken) {
    defaultHeaders.Authorization = `Bearer ${authToken}`;
  }

  const requestBody = customOptions.body;

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const url =
    typeof window !== "undefined"
      ? `/api/${cleanEndpoint}`
      : `${API_BASE}/${cleanEndpoint}`;
  const method = (customOptions.method ?? "GET").toUpperCase();

  const request = async (): Promise<T> => {
    const requestSignal = createRequestSignal(
      customOptions.signal,
      DEFAULT_REQUEST_TIMEOUT_MS
    );

    let res: Response;
    try {
      res = await fetch(url, {
        ...customOptions,
        body: requestBody,
        headers: defaultHeaders,
        cache: customOptions.cache ?? "no-store",
        signal: requestSignal.signal,
      });
    } catch (err) {
      // Anroparens abort (TanStack Query-avbrott, unmount) ska behålla sin
      // identitet — den är inte ett fel som ska visas för användaren.
      if (customOptions.signal?.aborted) {
        throw err;
      }

      if (requestSignal.didTimeOut()) {
        throw new ApiError(
          "Servern svarade inte i tid. Försök igen om en stund.",
          0,
          null
        );
      }

      // Nätverksfel får status 0 så att felhantering/retry kan skilja dem
      // från deterministiska HTTP-fel.
      throw new ApiError("Kunde inte nå servern.", 0, null);
    } finally {
      requestSignal.cleanup();
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

    const decodedBody = decodeRichTextPayload(parsed);

    if (!res.ok) {
      // Om token var ogiltig (401), rensa den direkt så vi slipper problem vid nästa laddning
      if (res.status === 401 && typeof window !== "undefined") {
        setStoredAuthToken(null);
      }

      const message =
        decodedBody?.message ||
        decodedBody?.error ||
        decodedBody?.detail ||
        (typeof decodedBody === "string" ? decodedBody : null) ||
        STATUS_MESSAGES[res.status] ||
        res.statusText ||
        `Något gick fel (${res.status}).`;

      throw new ApiError(String(message), res.status, decodedBody);
    }

    if (!rawBody) return undefined as T;
    if (responseType === "text") return decodeRichText(rawBody) as T;
    return decodedBody as T;
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
