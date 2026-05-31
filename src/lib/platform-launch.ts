import { normalizePathname } from "@/i18n/config";

const enabledValues = new Set(["1", "true", "yes", "on", "launched"]);

const prelaunchPublicSitePaths = new Set([
  "/",
  "/for-foretag",
  "/partners",
  "/om-oss",
  "/anvandarvillkor",
  "/integritetspolicy",
  "/cookiepolicy",
]);

export function isPlatformLaunched() {
  const value = process.env.NEXT_PUBLIC_PLATFORM_LAUNCHED ?? "";
  return enabledValues.has(value.trim().toLowerCase());
}

export function isPrelaunchPublicSitePath(pathname: string) {
  return prelaunchPublicSitePaths.has(normalizePathname(pathname));
}
