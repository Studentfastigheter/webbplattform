import { NextResponse, type NextRequest } from "next/server";

function getHostname(req: NextRequest) {
  const host = req.headers.get("host") ?? "";

  return host.split(":")[0].toLowerCase();
}

function pathStartsWithSegment(pathname: string, segment: "/portal" | "/admin") {
  return pathname === segment || pathname.startsWith(`${segment}/`);
}

function isPublicAssetPath(pathname: string) {
  return /\.[^/]+$/.test(pathname);
}

export function middleware(req: NextRequest) {
  const hostname = getHostname(req);
  const url = req.nextUrl.clone();
  const { pathname } = url;

  if (isPublicAssetPath(pathname)) {
    return NextResponse.next();
  }

  const isPortalSubdomain = hostname.startsWith("portal.");
  const isAdminSubdomain = hostname.startsWith("admin.");

  if (isPortalSubdomain) {
    if (!pathStartsWithSegment(pathname, "/portal")) {
      url.pathname = `/portal${pathname}`;
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }

  if (isAdminSubdomain) {
    if (pathname === "/" || pathname === "/admin") {
      url.pathname = "/tags";
      return NextResponse.redirect(url);
    }

    if (!pathStartsWithSegment(pathname, "/admin")) {
      url.pathname = `/admin${pathname}`;
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }

  if (
    pathStartsWithSegment(pathname, "/portal") ||
    pathStartsWithSegment(pathname, "/admin")
  ) {
    url.pathname = "/404";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
