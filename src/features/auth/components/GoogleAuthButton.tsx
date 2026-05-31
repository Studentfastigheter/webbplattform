"use client";

import { useEffect, useRef, useState } from "react";

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

function loadGoogleScript(errorMessages: { browserOnly: string; loadFailed: string }) {
  if (typeof window === "undefined") {
    return Promise.reject(new Error(errorMessages.browserOnly));
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  const existingScript = document.getElementById(googleScriptId);
  if (existingScript) {
    return new Promise<void>((resolve, reject) => {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(), { once: true });
    });
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = googleScriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(errorMessages.loadFailed));
    document.head.appendChild(script);
  });
}

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
  const credentialHandlerRef = useRef(onCredential);
  const [isConfigured] = useState(Boolean(googleClientId));
  const [buttonWidth, setButtonWidth] = useState(0);

  credentialHandlerRef.current = onCredential;

  useEffect(() => {
    if (!isConfigured || disabled || !rootRef.current) return;

    const updateButtonWidth = () => {
      if (!rootRef.current) return;

      setButtonWidth(Math.round(rootRef.current.getBoundingClientRect().width));
    };

    updateButtonWidth();

    const resizeObserver = new ResizeObserver(updateButtonWidth);
    resizeObserver.observe(rootRef.current);

    return () => resizeObserver.disconnect();
  }, [disabled, isConfigured]);

  useEffect(() => {
    if (!isConfigured || disabled || !buttonRef.current || buttonWidth <= 0) {
      return;
    }

    let active = true;

    loadGoogleScript({
      browserOnly: localizedText(locale, "Google Sign-In kan bara laddas i webbläsaren.", "Google Sign-In can only be loaded in the browser."),
      loadFailed: localizedText(locale, "Kunde inte ladda Google Sign-In.", "Could not load Google Sign-In."),
    })
      .then(() => {
        if (!active || !buttonRef.current || !window.google?.accounts?.id) {
          return;
        }

        buttonRef.current.innerHTML = "";
        window.google.accounts.id.initialize({
          client_id: googleClientId!,
          callback: async (response) => {
            const credential = response.credential?.trim();
            if (!credential) {
              onError?.(localizedText(locale, "Google skickade ingen ID-token.", "Google did not send an ID token."));
              return;
            }

            await credentialHandlerRef.current(credential);
          },
        });
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          width: buttonWidth,
          logo_alignment: "left",
        });
      })
      .catch((error) => {
        onError?.(
          error instanceof Error ? error.message : localizedText(locale, "Kunde inte ladda Google Sign-In.", "Could not load Google Sign-In.")
        );
      });

    return () => {
      active = false;
    };
  }, [buttonWidth, disabled, isConfigured, locale, onError]);

  const buttonChromeClassName =
    "flex min-h-[48px] w-full items-center justify-center gap-3 rounded-full border border-transparent bg-[#f2f2f2] px-4 text-sm font-semibold transition-colors";

  if (!isConfigured) {
    return (
      <button
        type="button"
        disabled
        className={cn(buttonChromeClassName, "text-[#7a7a7a]")}
      >
        <GoogleLogo />
        {localizedText(locale, "Google Sign-In saknar client id", "Google Sign-In is missing a client ID")}
      </button>
    );
  }

  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className={cn(buttonChromeClassName, "text-[#7a7a7a]")}
      >
        <GoogleLogo />
        {resolvedLabel}
      </button>
    );
  }

  return (
    <div
      ref={rootRef}
      className="group relative min-h-[48px] w-full rounded-full focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#004225]"
    >
      <div
        className={cn(
          buttonChromeClassName,
          "pointer-events-none text-[#252525] group-hover:bg-[#e8e8e8]"
        )}
      >
        <GoogleLogo />
        <span>{resolvedLabel}</span>
      </div>
      <div
        ref={buttonRef}
        aria-label={resolvedLabel}
        className="absolute inset-0 z-10 h-full w-full overflow-hidden rounded-full opacity-0 [&_*]:!h-full [&_*]:!w-full [&_iframe]:!rounded-full"
      />
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
