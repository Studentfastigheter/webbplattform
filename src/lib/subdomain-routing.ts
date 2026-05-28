function withoutSubdomain(hostname: string) {
  if (hostname.startsWith("portal.")) {
    return hostname.slice("portal.".length);
  }

  if (hostname.startsWith("admin.")) {
    return hostname.slice("admin.".length);
  }

  if (hostname.startsWith("www.")) {
    return hostname.slice("www.".length);
  }

  return hostname;
}

function buildSubdomainUrl(subdomain: string, pathname: string, token?: string | null) {
  if (typeof window === "undefined") {
    return pathname;
  }

  const targetPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const { protocol, hostname, port } = window.location;
  const rootHost = withoutSubdomain(hostname);
  const url = new URL(`${protocol}//${subdomain}.${rootHost}${port ? `:${port}` : ""}`);

  url.pathname = targetPath;

  if (token) {
    url.hash = new URLSearchParams({ token }).toString();
  }

  return url.toString();
}

export function getCurrentHostname() {
  return typeof window === "undefined" ? "" : window.location.hostname.toLowerCase();
}

export function isAdminSubdomain() {
  return getCurrentHostname().startsWith("admin.");
}

export function isPortalSubdomain() {
  return getCurrentHostname().startsWith("portal.");
}

export function buildPortalUrl(pathname = "/", token?: string | null) {
  return buildSubdomainUrl("portal", pathname, token);
}

export function buildMainDomainUrl(pathname = "/") {
  if (typeof window === "undefined") {
    return pathname;
  }

  const targetPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const { protocol, hostname, port } = window.location;
  const rootHost = withoutSubdomain(hostname);
  const url = new URL(`${protocol}//${rootHost}${port ? `:${port}` : ""}`);

  url.pathname = targetPath;

  return url.toString();
}
