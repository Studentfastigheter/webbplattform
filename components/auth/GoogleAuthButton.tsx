"use client";

import { useEffect, useRef, useState } from "react";

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

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const googleScriptId = "google-identity-services";

function loadGoogleScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Sign-In kan bara laddas i webbläsaren."));
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
    script.onerror = () => reject(new Error("Kunde inte ladda Google Sign-In."));
    document.head.appendChild(script);
  });
}

export function GoogleAuthButton({
  label = "Fortsätt med Google",
  disabled = false,
  onCredential,
  onError,
}: GoogleAuthButtonProps) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const credentialHandlerRef = useRef(onCredential);
  const [isConfigured] = useState(Boolean(googleClientId));

  credentialHandlerRef.current = onCredential;

  useEffect(() => {
    if (!isConfigured || disabled || !buttonRef.current) return;

    let active = true;

    loadGoogleScript()
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
              onError?.("Google skickade ingen ID-token.");
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
          shape: "rectangular",
          width: 320,
          logo_alignment: "left",
        });
      })
      .catch((error) => {
        onError?.(
          error instanceof Error ? error.message : "Kunde inte ladda Google Sign-In."
        );
      });

    return () => {
      active = false;
    };
  }, [disabled, isConfigured, onError]);

  if (!isConfigured) {
    return (
      <button
        type="button"
        disabled
        className="flex min-h-[44px] w-full items-center justify-center rounded-[8px] border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-muted-foreground"
      >
        Google Sign-In saknar client id
      </button>
    );
  }

  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className="flex min-h-[44px] w-full items-center justify-center rounded-[8px] border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-muted-foreground"
      >
        {label}
      </button>
    );
  }

  return <div ref={buttonRef} aria-label={label} className="flex justify-center" />;
}
