// Production Freja eID app launch endpoint. QR codes / same-device deep links
// built from this open the real Freja eID app. Set
// NEXT_PUBLIC_FREJA_LAUNCH_BASE_URL="https://app.test.frejaeid.com/freja" to
// point at the Freja eID+ test app instead (backend must run in test too).
const defaultFrejaLaunchBaseUrl = "https://app.frejaeid.com/freja";

const frejaLaunchBaseUrl =
  process.env.NEXT_PUBLIC_FREJA_LAUNCH_BASE_URL?.trim() ||
  defaultFrejaLaunchBaseUrl;

type ReturnUrlOptions = {
  query?: Record<string, string | null | undefined>;
  hash?: string;
};

export function buildFrejaLaunchUrl(
  transactionReference: string,
  originAppScheme?: string | null
) {
  const url = new URL(frejaLaunchBaseUrl);

  url.searchParams.set("action", "bindUserToTransaction");
  url.searchParams.set("transactionReference", transactionReference);

  if (originAppScheme?.trim()) {
    url.searchParams.set("originAppScheme", originAppScheme.trim());
  }

  return url.toString();
}

export function buildCurrentPageFrejaReturnUrl(options: ReturnUrlOptions = {}) {
  if (typeof window === "undefined") {
    return null;
  }

  const url = new URL(window.location.href);

  Object.entries(options.query ?? {}).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      url.searchParams.delete(key);
      return;
    }

    url.searchParams.set(key, value);
  });

  if (options.hash !== undefined) {
    url.hash = options.hash ? options.hash.replace(/^#/, "") : "";
  }

  return url.toString();
}

export function isFrejaSameDeviceLaunch() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const nav = navigator as Navigator & {
    userAgentData?: { mobile?: boolean };
  };

  if (nav.userAgentData?.mobile === true) {
    return true;
  }

  const userAgent = nav.userAgent;
  const isMobileUserAgent =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
      userAgent
    );
  const isIpadWithDesktopUserAgent =
    /Macintosh/i.test(userAgent) && nav.maxTouchPoints > 1;

  return isMobileUserAgent || isIpadWithDesktopUserAgent;
}
