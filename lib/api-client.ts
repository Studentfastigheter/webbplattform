// src/lib/api-client.ts

// Vi sätter bas-URL till .../api eftersom din backend använder den prefixen
export const API_BASE =
  typeof window === "undefined"
    ? process.env.API_BASE ?? "http://localhost:8080/api"
    : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

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

  // 1. Automatisk Token-hantering
  // Om ingen token skickas med, försök hämta den från localStorage
  let authToken = token;
  if (!authToken && typeof window !== "undefined") {
    const stored = localStorage.getItem("token");
    if (stored) authToken = stored;
  }

  if (authToken) {
    defaultHeaders.Authorization = `Bearer ${authToken}`;
  }

  // 2. URL-hantering
  // Ta bort inledande slash för att undvika dubbla slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const url = `${API_BASE}/${cleanEndpoint}`;

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

  // 3. Hantera svar
  // Om status är 204 (No Content), returnera tomt
  if (res.status === 204) {
    return {} as T;
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
    // 4. Hantera 401 (Token utgången)
    if (res.status === 401 && typeof window !== "undefined") {
      // Valfritt: Rensa token om den är ogiltig
      // localStorage.removeItem("token"); 
    }

    // Prioritera felmeddelande från backend (Spring Boot skickar ofta "message")
    const message =
      parsed?.message || 
      parsed?.error || 
      (typeof parsed === "string" ? parsed : null) ||
      STATUS_MESSAGES[res.status] ||
      res.statusText ||
      `Något gick fel (${res.status}).`;

    throw new Error(String(message));
  }

  if (!rawBody) return undefined as T;
  return parsed as T;
}