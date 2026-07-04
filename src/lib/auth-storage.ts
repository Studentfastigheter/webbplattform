/**
 * Central lagring av auth-token. Token ligger i localStorage (läses av
 * apiClient/AuthContext). Vid sidan av token sätts en httpOnly-fri
 * flagg-cookie (`cl_auth=1`) som ALDRIG innehåller själva tokenen — den
 * finns bara för att proxyn (src/proxy.ts) ska kunna gate:a /portal och
 * /admin serversidigt innan någon klientkod hunnit köra.
 *
 * Cookien sätts med Domain=.<apex> så att inloggning på huvuddomänen
 * följer med till portal./admin.-subdomänerna (krävs för token-överföringen
 * via URL-fragment, som proxyn aldrig kan se).
 */

const TOKEN_STORAGE_KEY = "token";

export const AUTH_FLAG_COOKIE_NAME = "cl_auth";

function cookieDomainAttribute(): string {
  const hostname = window.location.hostname;

  // localhost, *.localhost och rena IP-adresser: ingen Domain-attribut.
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    /^[\d.:]+$/.test(hostname) ||
    !hostname.includes(".")
  ) {
    return "";
  }

  const apex = hostname.split(".").slice(-2).join(".");
  return `; Domain=.${apex}`;
}

export function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredAuthToken(token: string | null): void {
  if (typeof window === "undefined") {
    return;
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    document.cookie = `${AUTH_FLAG_COOKIE_NAME}=1; Path=/; Max-Age=2592000; SameSite=Lax${cookieDomainAttribute()}${secure}`;
    return;
  }

  localStorage.removeItem(TOKEN_STORAGE_KEY);
  document.cookie = `${AUTH_FLAG_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax${cookieDomainAttribute()}${secure}`;
}
