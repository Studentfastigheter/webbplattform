"use client";

import { useEffect, useRef, useState } from "react";

import { Loader2 } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

type GoogleAuthButtonProps = {
  label?: string;
  disabled?: boolean;
  onCredential: (credential: string) => void | Promise<void>;
  onError?: (message: string) => void;
};

type GoogleCredentialResponse = {
  credential?: string;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: Record<string, string | number | boolean>
          ) => void;
        };
      };
    };
  }
}

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;
const googleScriptId = "google-identity-services";
const scriptLoadTimeoutMs = 10_000;

/**
 * Delad laddning av GIS-skriptet. Promisen nollställs vid fel eller timeout
 * så att nästa försök laddar om från grunden — en tidigare misslyckad
 * <script>-tagg får aldrig lämna knappen permanent död.
 */
let gsiLoader: Promise<void> | null = null;

function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  gsiLoader ??= new Promise<void>((resolve, reject) => {
    document.getElementById(googleScriptId)?.remove();

    const script = document.createElement("script");
    script.id = googleScriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;

    const fail = (reason: string) => {
      window.clearTimeout(timeoutId);
      gsiLoader = null;
      script.remove();
      reject(new Error(reason));
    };

    const timeoutId = window.setTimeout(
      () => fail("gsi-timeout"),
      scriptLoadTimeoutMs
    );

    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.clearTimeout(timeoutId);
        resolve();
      } else {
        fail("gsi-unavailable");
      }
    };
    script.onerror = () => fail("gsi-load-error");

    document.head.appendChild(script);
  });

  return gsiLoader;
}

type GsiStatus = "loading" | "ready" | "error";

export function GoogleAuthButton({
  label,
  disabled = false,
  onCredential,
  onError,
}: GoogleAuthButtonProps) {
  const { locale } = useI18n();
  const resolvedLabel = label ?? localizedText(locale, "Fortsätt med Google", "Continue with Google");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLDivElement | null>(null);
  // Refs i stället för effect-beroenden: nya callbacks/locale ska inte riva
  // och bygga om Googles iframe (varje ombyggnad är ett kort dött fönster).
  const credentialHandlerRef = useRef(onCredential);
  const errorHandlerRef = useRef(onError);
  const localeRef = useRef(locale);
  const [status, setStatus] = useState<GsiStatus>("loading");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [buttonWidth, setButtonWidth] = useState(0);

  useEffect(() => {
    credentialHandlerRef.current = onCredential;
    errorHandlerRef.current = onError;
    localeRef.current = locale;
  });

  const isConfigured = Boolean(googleClientId);

  // Mät bredden direkt vid mount — även i disabled-läge — så att Googles
  // knapp kan renderas i rätt storlek i samma stund som skriptet är klart.
  useEffect(() => {
    if (!isConfigured || !rootRef.current) return;

    const measure = () => {
      if (!rootRef.current) return;

      setButtonWidth(Math.round(rootRef.current.getBoundingClientRect().width));
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(rootRef.current);

    return () => resizeObserver.disconnect();
  }, [isConfigured]);

  // Ladda GIS-skriptet vid mount, inte vid klick, så att knappen normalt
  // redan är redo när användaren når den. `loadAttempt` driver "försök igen".
  useEffect(() => {
    if (!isConfigured) return;

    let active = true;

    loadGoogleIdentityScript()
      .then(() => {
        if (active) setStatus("ready");
      })
      .catch(() => {
        if (!active) return;

        setStatus("error");
        errorHandlerRef.current?.(
          localizedText(localeRef.current, "Kunde inte ladda Google Sign-In.", "Could not load Google Sign-In.")
        );
      });

    return () => {
      active = false;
    };
  }, [isConfigured, loadAttempt]);

  // Rendera Googles riktiga knapp (den osynliga overlayen) när skriptet är
  // klart. Körs bara om när bredden ändras — aldrig vid disabled/submit-
  // växlingar, så att iframen inte rivs i onödan.
  useEffect(() => {
    if (status !== "ready" || buttonWidth <= 0) return;

    const container = buttonRef.current;
    const gsi = window.google?.accounts?.id;
    if (!container || !gsi) return;

    container.innerHTML = "";
    gsi.initialize({
      client_id: googleClientId!,
      callback: async (response) => {
        const credential = response.credential?.trim();
        if (!credential) {
          errorHandlerRef.current?.(
            localizedText(localeRef.current, "Google skickade ingen ID-token.", "Google did not send an ID token.")
          );
          return;
        }

        await credentialHandlerRef.current(credential);
      },
    });
    gsi.renderButton(container, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "pill",
      width: buttonWidth,
      logo_alignment: "left",
    });
  }, [status, buttonWidth]);

  const buttonChromeClassName =
    "flex min-h-[48px] w-full items-center justify-center gap-3 rounded-full border border-transparent bg-[#f2f2f2] px-4 text-sm font-semibold transition-colors";

  if (!isConfigured) {
    return (
      <button
        type="button"
        disabled
        className={cn(buttonChromeClassName, "text-[#6b6b6b]")}
      >
        <GoogleLogo />
        {localizedText(locale, "Google Sign-In saknar client id", "Google Sign-In is missing a client ID")}
      </button>
    );
  }

  const retryLabel = localizedText(locale, "Kunde inte ladda Google – försök igen", "Could not load Google – try again");
  const interactive = status === "ready" && !disabled;

  return (
    <div
      ref={rootRef}
      className="group relative min-h-[48px] w-full rounded-full focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand"
    >
      {/* Synligt skal — klickytan är Googles overlay resp. retry-knappen. */}
      <div
        aria-hidden="true"
        className={cn(
          buttonChromeClassName,
          "pointer-events-none",
          disabled ? "text-[#6b6b6b]" : "text-[#252525]",
          interactive && "group-hover:bg-[#e8e8e8]"
        )}
      >
        <GoogleLogo />
        <span>{status === "error" ? retryLabel : resolvedLabel}</span>
        {status === "loading" && (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#6b6b6b] motion-reduce:animate-none" />
        )}
      </div>

      {status === "error" ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setStatus("loading");
            setLoadAttempt((attempt) => attempt + 1);
          }}
          className="absolute inset-0 z-10 h-full w-full rounded-full opacity-0"
        >
          {retryLabel}
        </button>
      ) : (
        <div
          ref={buttonRef}
          role={status === "loading" ? "status" : undefined}
          aria-busy={status === "loading"}
          aria-label={resolvedLabel}
          className={cn(
            "absolute inset-0 z-10 h-full w-full overflow-hidden rounded-full opacity-0 [&_*]:!h-full [&_*]:!w-full [&_iframe]:!rounded-full",
            !interactive && "pointer-events-none"
          )}
        />
      )}
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
    >
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.78-.07-1.53-.2-2.23H12v4.22h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.52z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.97-.9 6.62-2.44l-3.24-2.51c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.6-4.12H3.06v2.6A10 10 0 0 0 12 22z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 13.89A6 6 0 0 1 6.08 12c0-.65.11-1.29.32-1.89v-2.6H3.06A10 10 0 0 0 2 12c0 1.61.39 3.13 1.06 4.49l3.34-2.6z"
      />
      <path
        fill="#EA4335"
        d="M12 5.99c1.47 0 2.79.5 3.83 1.5l2.87-2.88C16.96 2.99 14.69 2 12 2a10 10 0 0 0-8.94 5.51l3.34 2.6C7.2 7.75 9.4 5.99 12 5.99z"
      />
    </svg>
  );
}
