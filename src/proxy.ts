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

function setLocaleCookie(response: NextResponse, locale: Locale) {
  response.cookies.set(localeCookieName, locale, {
    maxAge: localeCookieMaxAge,
    path: "/",
    sameSite: "lax",
  });
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
  return response;
}

function rewriteWithLocale(req: NextRequest, url: URL, locale: Locale) {
  const response = NextResponse.rewrite(url, {
    request: {
      headers: requestHeadersWithLocale(req, locale),
    },
  });

  setLocaleCookie(response, locale);
  return response;
}

function redirectWithLocale(url: URL, locale: Locale) {
  const response = NextResponse.redirect(url);

  setLocaleCookie(response, locale);
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
    return nextWithLocale(req, locale);
  }

  const isPortalSubdomain = hostname.startsWith("portal.");
  const isAdminSubdomain = hostname.startsWith("admin.");

  if (isPortalSubdomain) {
    if (!pathStartsWithSegment(routingPathname, "/portal")) {
      url.pathname = `/portal${routingPathname === "/" ? "" : routingPathname}`;
      return rewriteWithLocale(req, url, locale);
    }

    if (urlLocale) {
      url.pathname = routingPathname;
      return rewriteWithLocale(req, url, locale);
    }

    return nextWithLocale(req, locale);
  }

  if (isAdminSubdomain) {
    if (routingPathname === "/" || routingPathname === "/admin") {
      url.pathname = "/tags";
      return redirectWithLocale(url, locale);
    }

    if (!pathStartsWithSegment(routingPathname, "/admin")) {
      url.pathname = `/admin${routingPathname === "/" ? "" : routingPathname}`;
      return rewriteWithLocale(req, url, locale);
    }

    if (urlLocale) {
      url.pathname = routingPathname;
      return rewriteWithLocale(req, url, locale);
    }

    return nextWithLocale(req, locale);
  }

  if (
    pathStartsWithSegment(routingPathname, "/portal") ||
    pathStartsWithSegment(routingPathname, "/admin")
  ) {
    url.pathname = "/404";
    return rewriteWithLocale(req, url, locale);
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
