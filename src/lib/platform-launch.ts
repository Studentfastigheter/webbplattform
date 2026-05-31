import { normalizePathname } from "@/i18n/config";

const enabledValues = new Set(["1", "true", "yes", "on", "launched"]);

const prelaunchPublicSitePaths = new Set([
  "/",
  "/for-business",
  "/partners",
  "/about-us",
  "/terms-of-service",
  "/privacy-policy",
  "/cookie-policy",
]);

export function isPlatformLaunched() {
  const value = process.env.NEXT_PUBLIC_PLATFORM_LAUNCHED ?? "";
  return enabledValues.has(value.trim().toLowerCase());
}

export function isPrelaunchPublicSitePath(pathname: string) {
  return prelaunchPublicSitePaths.has(normalizePathname(pathname));
}
