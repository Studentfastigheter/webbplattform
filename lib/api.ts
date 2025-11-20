export const API_BASE = ""; // using Next.js rewrites to /api

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

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers, cache: 'no-store' });
  const rawBody = await res.text().catch(() => "");

  if (!res.ok) {
    let message = "";

    if (rawBody) {
      try {
        const data = JSON.parse(rawBody);
        message =
          (data && (data.reason || data.message || data.error)) ||
          "";
      } catch {
        message = rawBody;
      }
    }

    if (!message) {
      message =
        STATUS_MESSAGES[res.status] ||
        res.statusText ||
        `Något gick fel (${res.status}).`;
    }

    throw new Error(message);
  }

  if (!rawBody) {
    return undefined as T;
  }

  try {
    return JSON.parse(rawBody) as T;
  } catch {
    throw new Error("Failed to parse server response");
  }
}
