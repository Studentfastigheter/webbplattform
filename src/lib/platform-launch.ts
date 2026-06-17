import { normalizePathname } from "@/i18n/config";

const enabledValues = new Set(["1", "true", "yes", "on", "launched"]);

export const prelaunchPublicSitePathnames = [
  "/",
  "/for-business",
  "/partners",
  "/about-us",
  "/terms-of-service",
  "/privacy-policy",
  "/cookie-policy",
] as const;

const prelaunchPublicSitePaths = new Set<string>(prelaunchPublicSitePathnames);

export function isPlatformLaunched() {
  const value = process.env.NEXT_PUBLIC_PLATFORM_LAUNCHED ?? "";
  return enabledValues.has(value.trim().toLowerCase());
}

export function isPrelaunchPublicSitePath(pathname: string) {
  return prelaunchPublicSitePaths.has(normalizePathname(pathname));
}
