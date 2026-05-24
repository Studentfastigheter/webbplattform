"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type DeviceType = "mobile" | "tablet" | "desktop" | "bot" | "unknown";
type LocationStatus =
  | "idle"
  | "loading"
  | "granted"
  | "denied"
  | "prompt"
  | "unsupported"
  | "unavailable"
  | "error";

type BrowserInfo = {
  name: string;
  version: string | null;
  engine: string | null;
  userAgent: string;
  userAgentData?: {
    brands?: Array<{ brand: string; version: string }>;
    mobile?: boolean;
    platform?: string;
  };
};

type DeviceInfo = {
  type: DeviceType;
  os: string;
  platform: string;
  vendor: string;
  hardwareConcurrency: number | null;
  deviceMemory: number | null;
  maxTouchPoints: number;
  cookieEnabled: boolean;
  onLine: boolean;
  doNotTrack: string | null;
};

type ScreenInfo = {
  width: number;
  height: number;
  availableWidth: number;
  availableHeight: number;
  colorDepth: number;
  pixelDepth: number;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  orientationType: string | null;
  orientationAngle: number | null;
  prefersColorScheme: "dark" | "light" | "no-preference";
  prefersReducedMotion: boolean;
  prefersReducedData: boolean;
  prefersContrast: "more" | "less" | "no-preference";
  pointer: "none" | "coarse" | "fine" | "unknown";
  hover: "none" | "hover" | "unknown";
};

type LocaleInfo = {
  language: string;
  languages: string[];
  timeZone: string | null;
  timeZoneOffsetMinutes: number;
};

type PageInfo = {
  href: string;
  origin: string;
  pathname: string;
  search: string;
  referrer: string;
  visibilityState: DocumentVisibilityState;
};

type StorageInfo = {
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
};

type NetworkInfo = {
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
  saveData: boolean | null;
};

type UserPosition = {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
};

export type UserEnvironment = {
  collectedAt: string;
  browser: BrowserInfo;
  device: DeviceInfo;
  screen: ScreenInfo;
  locale: LocaleInfo;
  page: PageInfo;
  storage: StorageInfo;
  network: NetworkInfo;
  location: {
    status: LocationStatus;
    permission: PermissionState | "unsupported" | null;
    position: UserPosition | null;
    error: string | null;
  };
};

type UserEnvironmentContextValue = {
  environment: UserEnvironment | null;
  isReady: boolean;
  refreshEnvironment: () => void;
  requestLocation: () => Promise<UserPosition | null>;
};

type NavigatorWithClientHints = Navigator & {
  userAgentData?: {
    brands?: Array<{ brand: string; version: string }>;
    mobile?: boolean;
    platform?: string;
  };
  deviceMemory?: number;
  connection?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  };
  mozConnection?: NavigatorWithClientHints["connection"];
  webkitConnection?: NavigatorWithClientHints["connection"];
};

const UserEnvironmentContext = createContext<UserEnvironmentContextValue | undefined>(
  undefined,
);

function getStorageSupport(storageName: "localStorage" | "sessionStorage") {
  try {
    const storage = window[storageName];
    const key = "__campuslyan_storage_test__";
    storage.setItem(key, key);
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function parseBrowser(userAgent: string): Pick<BrowserInfo, "name" | "version" | "engine"> {
  const browserRules: Array<[string, RegExp]> = [
    ["Edge", /Edg\/([\d.]+)/],
    ["Opera", /OPR\/([\d.]+)/],
    ["Chrome", /Chrome\/([\d.]+)/],
    ["Safari", /Version\/([\d.]+).*Safari/],
    ["Firefox", /Firefox\/([\d.]+)/],
  ];

  const browserMatch = browserRules.find(([, pattern]) => pattern.test(userAgent));
  const engine = /AppleWebKit/i.test(userAgent)
    ? "WebKit"
    : /Gecko/i.test(userAgent)
      ? "Gecko"
      : /Trident|MSIE/i.test(userAgent)
        ? "Trident"
        : null;

  if (!browserMatch) {
    return { name: "Unknown", version: null, engine };
  }

  const [, pattern] = browserMatch;
  return {
    name: browserMatch[0],
    version: pattern.exec(userAgent)?.[1] ?? null,
    engine,
  };
}

function detectOs(userAgent: string, platform: string) {
  if (/Windows/i.test(platform) || /Windows/i.test(userAgent)) return "Windows";
  if (/Mac/i.test(platform) || /Macintosh/i.test(userAgent)) return "macOS";
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "iOS";
  if (/Android/i.test(userAgent)) return "Android";
  if (/Linux/i.test(platform) || /Linux/i.test(userAgent)) return "Linux";
  return "Unknown";
}

function detectDeviceType(userAgent: string, viewportWidth: number, maxTouchPoints: number) {
  if (/bot|crawl|spider|slurp/i.test(userAgent)) return "bot";
  if (/Mobi|Android|iPhone|iPod/i.test(userAgent)) return "mobile";
  if (/iPad|Tablet/i.test(userAgent)) return "tablet";
  if (maxTouchPoints > 1 && viewportWidth < 1024) return "tablet";
  if (userAgent) return "desktop";
  return "unknown";
}

function getMediaQueryValue<T extends string>(
  rules: Array<[T, string]>,
  fallback: T,
) {
  return rules.find(([, query]) => window.matchMedia(query).matches)?.[0] ?? fallback;
}

function getNetworkInfo(nav: NavigatorWithClientHints): NetworkInfo {
  const connection = nav.connection ?? nav.mozConnection ?? nav.webkitConnection;

  return {
    effectiveType: connection?.effectiveType ?? null,
    downlink: connection?.downlink ?? null,
    rtt: connection?.rtt ?? null,
    saveData: connection?.saveData ?? null,
  };
}

function createEnvironmentSnapshot(
  location: UserEnvironment["location"],
): UserEnvironment {
  const nav = navigator as NavigatorWithClientHints;
  const userAgent = nav.userAgent;
  const parsedBrowser = parseBrowser(userAgent);
  const orientation = screen.orientation;
  const viewportWidth = window.innerWidth;
  const maxTouchPoints = nav.maxTouchPoints ?? 0;

  return {
    collectedAt: new Date().toISOString(),
    browser: {
      ...parsedBrowser,
      userAgent,
      userAgentData: nav.userAgentData
        ? {
            brands: nav.userAgentData.brands,
            mobile: nav.userAgentData.mobile,
            platform: nav.userAgentData.platform,
          }
        : undefined,
    },
    device: {
      type: detectDeviceType(userAgent, viewportWidth, maxTouchPoints),
      os: detectOs(userAgent, nav.platform),
      platform: nav.platform,
      vendor: nav.vendor,
      hardwareConcurrency: nav.hardwareConcurrency ?? null,
      deviceMemory: nav.deviceMemory ?? null,
      maxTouchPoints,
      cookieEnabled: nav.cookieEnabled,
      onLine: nav.onLine,
      doNotTrack: nav.doNotTrack ?? null,
    },
    screen: {
      width: screen.width,
      height: screen.height,
      availableWidth: screen.availWidth,
      availableHeight: screen.availHeight,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
      viewportWidth,
      viewportHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      orientationType: orientation?.type ?? null,
      orientationAngle: orientation?.angle ?? null,
      prefersColorScheme: getMediaQueryValue(
        [
          ["dark", "(prefers-color-scheme: dark)"],
          ["light", "(prefers-color-scheme: light)"],
        ],
        "no-preference",
      ),
      prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      prefersReducedData: window.matchMedia("(prefers-reduced-data: reduce)").matches,
      prefersContrast: getMediaQueryValue(
        [
          ["more", "(prefers-contrast: more)"],
          ["less", "(prefers-contrast: less)"],
        ],
        "no-preference",
      ),
      pointer: getMediaQueryValue(
        [
          ["fine", "(pointer: fine)"],
          ["coarse", "(pointer: coarse)"],
          ["none", "(pointer: none)"],
        ],
        "unknown",
      ),
      hover: getMediaQueryValue(
        [
          ["hover", "(hover: hover)"],
          ["none", "(hover: none)"],
        ],
        "unknown",
      ),
    },
    locale: {
      language: nav.language,
      languages: Array.from(nav.languages ?? []),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
      timeZoneOffsetMinutes: new Date().getTimezoneOffset(),
    },
    page: {
      href: window.location.href,
      origin: window.location.origin,
      pathname: window.location.pathname,
      search: window.location.search,
      referrer: document.referrer,
      visibilityState: document.visibilityState,
    },
    storage: {
      localStorage: getStorageSupport("localStorage"),
      sessionStorage: getStorageSupport("sessionStorage"),
      indexedDB: "indexedDB" in window,
    },
    network: getNetworkInfo(nav),
    location,
  };
}

function normalizePosition(position: GeolocationPosition): UserPosition {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
    altitude: position.coords.altitude,
    altitudeAccuracy: position.coords.altitudeAccuracy,
    heading: position.coords.heading,
    speed: position.coords.speed,
    timestamp: position.timestamp,
  };
}

function getPositionErrorMessage(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) return "Platsbehörighet nekades.";
  if (error.code === error.POSITION_UNAVAILABLE) return "Positionen är inte tillgänglig.";
  if (error.code === error.TIMEOUT) return "Positionshämtningen tog för lång tid.";
  return error.message || "Kunde inte hämta position.";
}

export function UserEnvironmentProvider({ children }: { children: React.ReactNode }) {
  const locationRef = useRef<UserEnvironment["location"]>({
    status: "idle",
    permission: null,
    position: null,
    error: null,
  });
  const [location, setLocation] = useState<UserEnvironment["location"]>({
    status: "idle",
    permission: null,
    position: null,
    error: null,
  });
  const [environment, setEnvironment] = useState<UserEnvironment | null>(null);

  const refreshEnvironment = useCallback(() => {
    setEnvironment(createEnvironmentSnapshot(location));
  }, [location]);

  const requestLocation = useCallback(async () => {
    if (!("geolocation" in navigator)) {
      const nextLocation: UserEnvironment["location"] = {
        ...locationRef.current,
        status: "unsupported",
        permission: "unsupported",
        error: "Geolocation stöds inte av webbläsaren.",
      };
      locationRef.current = nextLocation;
      setLocation(nextLocation);
      return null;
    }

    const loadingLocation: UserEnvironment["location"] = {
      ...locationRef.current,
      status: "loading",
      error: null,
    };
    locationRef.current = loadingLocation;
    setLocation(loadingLocation);

    return new Promise<UserPosition | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const normalizedPosition = normalizePosition(position);
          const nextLocation: UserEnvironment["location"] = {
            ...locationRef.current,
            status: "granted",
            permission: "granted",
            position: normalizedPosition,
            error: null,
          };
          locationRef.current = nextLocation;
          setLocation(nextLocation);
          resolve(normalizedPosition);
        },
        (error) => {
          const status: LocationStatus =
            error.code === error.PERMISSION_DENIED ? "denied" : "unavailable";

          const nextLocation: UserEnvironment["location"] = {
            ...locationRef.current,
            status,
            permission:
              error.code === error.PERMISSION_DENIED
                ? "denied"
                : locationRef.current.permission,
            error: getPositionErrorMessage(error),
          };
          locationRef.current = nextLocation;
          setLocation(nextLocation);
          resolve(null);
        },
        {
          enableHighAccuracy: false,
          maximumAge: 5 * 60 * 1000,
          timeout: 10 * 1000,
        },
      );
    });
  }, []);

  useEffect(() => {
    refreshEnvironment();
  }, [refreshEnvironment]);

  useEffect(() => {
    let permissionStatus: PermissionStatus | null = null;

    const syncPermission = async () => {
      if (!("permissions" in navigator) || !navigator.permissions.query) {
        setLocation((current) => ({ ...current, permission: "unsupported" }));
        return;
      }

      try {
        permissionStatus = await navigator.permissions.query({ name: "geolocation" });
        setLocation((current) => ({
          ...current,
          status: current.position ? current.status : permissionStatus?.state ?? "prompt",
          permission: permissionStatus?.state ?? null,
        }));

        permissionStatus.onchange = () => {
          const state = permissionStatus?.state ?? null;
          setLocation((current) => ({
            ...current,
            status: current.position ? current.status : state ?? "prompt",
            permission: state,
          }));
        };

        if (permissionStatus.state === "granted") {
          void requestLocation();
        }
      } catch {
        setLocation((current) => ({ ...current, permission: "unsupported" }));
      }
    };

    void syncPermission();

    return () => {
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, [requestLocation]);

  useEffect(() => {
    const updateSnapshot = () => {
      setEnvironment(createEnvironmentSnapshot(location));
    };

    const mediaQueries = [
      window.matchMedia("(prefers-color-scheme: dark)"),
      window.matchMedia("(prefers-color-scheme: light)"),
      window.matchMedia("(prefers-reduced-motion: reduce)"),
      window.matchMedia("(prefers-reduced-data: reduce)"),
      window.matchMedia("(prefers-contrast: more)"),
      window.matchMedia("(prefers-contrast: less)"),
      window.matchMedia("(pointer: fine)"),
      window.matchMedia("(pointer: coarse)"),
      window.matchMedia("(hover: hover)"),
    ];

    window.addEventListener("resize", updateSnapshot);
    window.addEventListener("orientationchange", updateSnapshot);
    window.addEventListener("online", updateSnapshot);
    window.addEventListener("offline", updateSnapshot);
    document.addEventListener("visibilitychange", updateSnapshot);
    mediaQueries.forEach((query) => query.addEventListener("change", updateSnapshot));

    return () => {
      window.removeEventListener("resize", updateSnapshot);
      window.removeEventListener("orientationchange", updateSnapshot);
      window.removeEventListener("online", updateSnapshot);
      window.removeEventListener("offline", updateSnapshot);
      document.removeEventListener("visibilitychange", updateSnapshot);
      mediaQueries.forEach((query) => query.removeEventListener("change", updateSnapshot));
    };
  }, [location]);

  const value = useMemo<UserEnvironmentContextValue>(
    () => ({
      environment,
      isReady: environment !== null,
      refreshEnvironment,
      requestLocation,
    }),
    [environment, refreshEnvironment, requestLocation],
  );

  return (
    <UserEnvironmentContext.Provider value={value}>
      {children}
    </UserEnvironmentContext.Provider>
  );
}

export function useUserEnvironment() {
  const context = useContext(UserEnvironmentContext);
  if (!context) {
    throw new Error("useUserEnvironment must be used within UserEnvironmentProvider");
  }
  return context;
}
