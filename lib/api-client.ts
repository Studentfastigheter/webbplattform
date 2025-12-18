// src/lib/api-client.ts

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

export function buildQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).length > 0) {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function apiClient<T>(
  endpoint: string,
  { headers, ...customOptions }: RequestInit = {},
  token?: string
): Promise<T> {
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;

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
      (parsed && typeof parsed === "object" && (parsed as any).reason) ||
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