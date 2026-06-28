import { NextResponse, type NextRequest } from "next/server";
import {
  defaultLocale,
  getLocaleFromAcceptLanguage,
  getLocaleFromCookieValue,
  getLocaleFromPathname,
  localeCookieMaxAge,
  localeCookieName,
  localizePathname,
  stripLocaleFromPathname,
  type Locale,
} from "@/i18n/config";
import {
  isPlatformLaunched,
  isPrelaunchPublicSitePath,
} from "@/lib/platform-launch";
import { isPrivateIndexingHost } from "@/lib/seo";

const PRIVATE_SUBDOMAIN_ROBOTS_HEADER = "noindex, nofollow, noarchive, nosnippet";
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline' https:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
  "connect-src 'self' https: http://localhost:* http://127.0.0.1:* ws: wss:",
  "frame-src 'self' https:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "media-src 'self' https: blob:",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = [
  ["Content-Security-Policy", CONTENT_SECURITY_POLICY],
  ["Cross-Origin-Opener-Policy", "same-origin"],
  ["Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload"],
  ["X-Content-Type-Options", "nosniff"],
  ["X-Frame-Options", "DENY"],
] as const;

function getHostname(req: NextRequest) {
  const host = req.headers.get("host") ?? "";

  return host.split(":")[0].toLowerCase();
}

const internalLocaleSearchParam = "__campuslyan_locale";

function pathStartsWithSegment(pathname: string, segment: "/portal" | "/admin") {
  return pathname === segment || pathname.startsWith(`${segment}/`);
}

function isPublicAssetPath(pathname: string) {
  return /\.[^/]+$/.test(pathname);
}

function isImmutablePublicAssetPath(pathname: string) {
  return /\.(?:avif|webp|png|jpe?g|gif|svg|ico|woff2?)$/i.test(pathname);
}

function setLocaleCookie(response: NextResponse, locale: Locale) {
  response.cookies.set(localeCookieName, locale, {
    maxAge: localeCookieMaxAge,
    path: "/",
    sameSite: "lax",
  });
}

function withSecurityHeaders(response: NextResponse) {
  SECURITY_HEADERS.forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

function nextPublicAsset(pathname: string) {
  const response = withSecurityHeaders(NextResponse.next());

  if (isImmutablePublicAssetPath(pathname)) {
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  }

  return response;
}

function requestHeadersWithLocale(req: NextRequest, locale: Locale) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-campuslyan-locale", locale);

  return requestHeaders;
}

function resolvePreferredLocale(
  req: NextRequest,
  urlLocale: Locale | null,
  internalLocale: Locale | null,
) {
  return (
    urlLocale ??
    internalLocale ??
    getLocaleFromCookieValue(req.cookies.get(localeCookieName)?.value) ??
    getLocaleFromAcceptLanguage(req.headers.get("accept-language")) ??
    defaultLocale
  );
}

function nextWithLocale(req: NextRequest, locale: Locale) {
  const response = NextResponse.next({
    request: {
      headers: requestHeadersWithLocale(req, locale),
    },
  });

  setLocaleCookie(response, locale);
  return withSecurityHeaders(response);
}

function rewriteWithLocale(req: NextRequest, url: URL, locale: Locale) {
  const response = NextResponse.rewrite(url, {
    request: {
      headers: requestHeadersWithLocale(req, locale),
    },
  });

  setLocaleCookie(response, locale);
  return withSecurityHeaders(response);
}

function redirectWithLocale(url: URL, locale: Locale) {
  const response = NextResponse.redirect(url);

  setLocaleCookie(response, locale);
  return withSecurityHeaders(response);
}

function withNoIndexHeader(response: NextResponse) {
  response.headers.set("X-Robots-Tag", PRIVATE_SUBDOMAIN_ROBOTS_HEADER);
  return response;
}

function redirectToPrelaunchHome(url: URL, locale: Locale) {
  url.pathname = localizePathname("/", locale);
  url.search = "";
  return redirectWithLocale(url, locale);
}

export function proxy(req: NextRequest) {
  const hostname = getHostname(req);
  const url = req.nextUrl.clone();
  const { pathname } = url;
  const urlLocale = getLocaleFromPathname(pathname);
  const internalLocale = getLocaleFromCookieValue(url.searchParams.get(internalLocaleSearchParam));
  const locale = resolvePreferredLocale(req, urlLocale, internalLocale);
  const routingPathname = stripLocaleFromPathname(pathname);

  if (isPublicAssetPath(pathname)) {
    return nextPublicAsset(pathname);
  }

  const isPortalSubdomain = hostname.startsWith("portal.");
  const isAdminSubdomain = hostname.startsWith("admin.");
  const isPrivateSubdomain = isPrivateIndexingHost(hostname);

  if (isPortalSubdomain) {
    if (!pathStartsWithSegment(routingPathname, "/portal")) {
      url.pathname = `/portal${routingPathname === "/" ? "" : routingPathname}`;
      return withNoIndexHeader(rewriteWithLocale(req, url, locale));
    }

    if (urlLocale) {
      url.pathname = routingPathname;
      return withNoIndexHeader(rewriteWithLocale(req, url, locale));
    }

    return withNoIndexHeader(nextWithLocale(req, locale));
  }

  if (isAdminSubdomain) {
    if (routingPathname === "/" || routingPathname === "/admin") {
      url.pathname = "/tags";
      return withNoIndexHeader(redirectWithLocale(url, locale));
    }

    if (!pathStartsWithSegment(routingPathname, "/admin")) {
      url.pathname = `/admin${routingPathname === "/" ? "" : routingPathname}`;
      return withNoIndexHeader(rewriteWithLocale(req, url, locale));
    }

    if (urlLocale) {
      url.pathname = routingPathname;
      return withNoIndexHeader(rewriteWithLocale(req, url, locale));
    }

    return withNoIndexHeader(nextWithLocale(req, locale));
  }

  if (
    pathStartsWithSegment(routingPathname, "/portal") ||
    pathStartsWithSegment(routingPathname, "/admin")
  ) {
    url.pathname = "/404";
    const response = rewriteWithLocale(req, url, locale);
    return isPrivateSubdomain ? withNoIndexHeader(response) : response;
  }

  if (!isPlatformLaunched() && !isPrelaunchPublicSitePath(routingPathname)) {
    return redirectToPrelaunchHome(url, locale);
  }

  if (internalLocale && !urlLocale) {
    return nextWithLocale(req, locale);
  }

  if (!urlLocale && locale === "en") {
    url.pathname = localizePathname(pathname, "en");
    return redirectWithLocale(url, locale);
  }

  if (urlLocale) {
    url.pathname = routingPathname;
    url.searchParams.set(internalLocaleSearchParam, locale);
    return rewriteWithLocale(req, url, locale);
  }

  return nextWithLocale(req, locale);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
