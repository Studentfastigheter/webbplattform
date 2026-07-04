"use client";

import Image from "next/image";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2Icon,
  Clock3Icon,
  RefreshCwIcon,
  Smartphone,
} from "@/components/icons";
import { QRCodeSVG } from "qrcode.react";

import { AuthCard } from "@/components/ui/AuthCard";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/features/auth/services/auth-service";
import {
  buildCurrentPageFrejaReturnUrl,
  buildFrejaLaunchUrl,
  isFrejaSameDeviceLaunch,
} from "@/features/auth/lib/freja-launch";
import {
  clearQuickRegisterAuthRef,
  startOrResumeQuickRegisterVerification,
  writeQuickRegisterAuthRef,
} from "@/features/auth/lib/freja-verification-storage";
import type { FrejaAuthStatus } from "@/types";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

const pollIntervalMs = 2000;
const frejaLogoPath =
  "/FrejaBrandingPackNew/FrejaBrandingPack/Freja Logo/Freja/SVG/FrejaIndigo.svg";
const frejaIconPath =
  "/FrejaBrandingPackNew/FrejaBrandingPack/Freja Icons/Freja Icons SVG/FrejaRoundedGradient.svg";

const frejaAuthStatuses = [
  "PENDING",
  "MATCHES",
  "CLASHING",
  "DISAPPROVED",
  "EXPIRED",
  "CANCELED",
] as const satisfies readonly FrejaAuthStatus[];

const statusMessages: Record<FrejaAuthStatus, { sv: string; en: string }> = {
  PENDING: { sv: "Väntar på godkännande i Freja.", en: "Waiting for approval in Freja." },
  MATCHES: { sv: "Kontot är verifierat. Du skickas vidare.", en: "The account is verified. You will be redirected." },
  CLASHING: {
    sv: "Freja-identiteten matchade inte registreringen, eller så finns kontot redan.",
    en: "The Freja identity did not match the registration, or the account already exists.",
  },
  DISAPPROVED: { sv: "Verifieringen nekades i Freja-appen.", en: "The verification was rejected in the Freja app." },
  EXPIRED: { sv: "Verifieringen hann löpa ut innan den godkändes.", en: "The verification expired before it was approved." },
  CANCELED: { sv: "Verifieringen avbröts.", en: "The verification was canceled." },
};

const statusPillLabels: Record<FrejaAuthStatus, { sv: string; en: string }> = {
  PENDING: { sv: "Väntar på Freja", en: "Waiting for Freja" },
  MATCHES: { sv: "Verifierad", en: "Verified" },
  CLASHING: { sv: "Kontrollera ärendet", en: "Check the case" },
  DISAPPROVED: { sv: "Nekad", en: "Rejected" },
  EXPIRED: { sv: "Tiden gick ut", en: "Expired" },
  CANCELED: { sv: "Avbruten", en: "Canceled" },
};

type FrejaFlow = "quick-register" | "freja-only";

function isFrejaAuthStatus(value: unknown): value is FrejaAuthStatus {
  return (
    typeof value === "string" &&
    (frejaAuthStatuses as readonly string[]).includes(value)
  );
}

function getStatusAction(status: FrejaAuthStatus, flow: FrejaFlow, locale: "sv" | "en") {
  if (flow === "quick-register") {
    if (status === "MATCHES") {
      return { href: "/housing", label: localizedText(locale, "Fortsätt", "Continue") };
    }

    if (status === "EXPIRED" || status === "CANCELED") {
      return {
        href: "/register/freja-id?flow=quick-register",
        label: localizedText(locale, "Starta Freja igen", "Start Freja again"),
      };
    }

    return {
      href: "/register",
      label: localizedText(locale, "Tillbaka till registrering", "Back to registration"),
    };
  }

  if (status === "MATCHES") {
    return { href: "/login", label: localizedText(locale, "Gå till inloggning", "Go to login") };
  }

  if (status === "EXPIRED" || status === "CANCELED") {
    return {
      href: "/register/freja-id?start=freja",
      label: localizedText(locale, "Starta Freja igen", "Start Freja again"),
    };
  }

  return {
    href: "/register",
    label: localizedText(locale, "Tillbaka till registrering", "Back to registration"),
  };
}

function getStatusTone(status: FrejaAuthStatus) {
  if (status === "MATCHES") return "success";
  if (status === "DISAPPROVED" || status === "EXPIRED" || status === "CANCELED") {
    return "error";
  }

  return "pending";
}

function StatusPill({ status }: { status: FrejaAuthStatus }) {
  const { locale } = useI18n();
  const tone = getStatusTone(status);
  const Icon =
    tone === "success"
      ? CheckCircle2Icon
      : tone === "error"
        ? RefreshCwIcon
        : Clock3Icon;

  return (
    <div
      className={cn(
        "inline-flex h-9 max-w-[190px] items-center gap-2 rounded-full border px-3 text-sm font-medium",
        tone === "success" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        tone === "error" && "border-red-200 bg-red-50 text-red-700",
        tone === "pending" && "border-[#3E3A93]/15 bg-[#3E3A93]/5 text-[#3E3A93]"
      )}
    >
      <Icon className={cn("h-4 w-4", tone === "pending" && "animate-pulse")} />
      <span className="truncate">
        {localizedText(locale, statusPillLabels[status].sv, statusPillLabels[status].en)}
      </span>
    </div>
  );
}

function FrejaIdRegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const { locale, localizedHref } = useI18n();
  const initialAuthRef = searchParams.get("authRef")?.trim() ?? "";
  const shouldStartFrejaOnly = searchParams.get("start") === "freja";
  const requestedFlow = searchParams.get("flow");
  const flow: FrejaFlow =
    shouldStartFrejaOnly || requestedFlow === "freja"
      ? "freja-only"
      : "quick-register";
  const isFrejaOnlyFlow = flow === "freja-only";
  const [authRef, setAuthRef] = useState(initialAuthRef);
  const [status, setStatus] = useState<FrejaAuthStatus>("PENDING");
  const [pollError, setPollError] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [useSameDeviceLaunch, setUseSameDeviceLaunch] = useState(false);
  const [frejaReturnUrl, setFrejaReturnUrl] = useState<string | null>(null);

  const frejaAuthUrl = useMemo(
    () =>
      authRef
        ? buildFrejaLaunchUrl(
            authRef,
            useSameDeviceLaunch ? frejaReturnUrl : null
          )
        : "",
    [authRef, frejaReturnUrl, useSameDeviceLaunch]
  );

  useEffect(() => {
    setUseSameDeviceLaunch(isFrejaSameDeviceLaunch());

    if (!authRef) {
      setFrejaReturnUrl(null);
      return;
    }

    setFrejaReturnUrl(
      buildCurrentPageFrejaReturnUrl({
        query: isFrejaOnlyFlow
          ? { start: "freja", flow: null, authRef }
          : { flow: "quick-register", start: null, authRef },
      })
    );
  }, [authRef, isFrejaOnlyFlow]);

  useEffect(() => {
    if (authRef) return;
    if (flow === "quick-register" && authLoading) return;

    let active = true;

    async function startFrejaFlow() {
      setIsStarting(true);
      setStartError(null);
      try {
        if (flow === "quick-register" && user?.accountType !== "quick_register") {
          throw new Error(
            localizedText(
              locale,
              "Logga in med ditt nya konto för att verifiera med Freja.",
              "Sign in with your new account to verify with Freja."
            )
          );
        }

        const request =
          flow === "quick-register"
            ? startOrResumeQuickRegisterVerification(user, () =>
                authService.registerStudent()
              )
            : authService.frejaRegister();
        const response = await request;
        if (!active) return;
        setStatus("PENDING");
        setAuthRef(response.authRef);
      } catch (err) {
        if (!active) return;
        setStartError(
          err instanceof Error
            ? err.message
            : flow === "quick-register"
              ? localizedText(locale, "Kunde inte starta Freja-verifieringen.", "Could not start Freja verification.")
              : localizedText(locale, "Kunde inte starta Freja-registreringen.", "Could not start Freja registration.")
        );
      } finally {
        if (active) {
          setIsStarting(false);
        }
      }
    }

    startFrejaFlow();

    return () => {
      active = false;
    };
  }, [authLoading, authRef, flow, locale, user]);

  useEffect(() => {
    if (flow === "quick-register" && authRef && user?.accountType === "quick_register") {
      writeQuickRegisterAuthRef(user, authRef);
    }
  }, [authRef, flow, user]);

  useEffect(() => {
    if (!authRef) return;

    let active = true;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    // Backoff vid fel så en nerliggande backend inte hamras varannan sekund
    // i all evighet; efter maxantalet ger vi ett definitivt felmeddelande.
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 15;
    const maxErrorDelayMs = 15_000;

    async function poll() {
      try {
        const result = await authService.pollAuthStatus(authRef);
        if (!active) return;

        consecutiveErrors = 0;

        if (!isFrejaAuthStatus(result)) {
          setPollError(localizedText(locale, "Backend skickade en okänd Freja-status.", "The backend returned an unknown Freja status."));
          return;
        }

        const nextStatus = result;
        setStatus(nextStatus);
        setPollError(null);

        if (nextStatus === "PENDING") {
          timeout = setTimeout(poll, pollIntervalMs);
        } else if (nextStatus === "MATCHES" && flow === "quick-register") {
          clearQuickRegisterAuthRef(user);
          setAuthRef("");
          await refreshUser();
          router.replace(localizedHref("/housing"));
        } else if (nextStatus === "MATCHES") {
          setAuthRef("");
          router.replace(localizedHref("/login"));
        } else if (flow === "quick-register") {
          clearQuickRegisterAuthRef(user);
        }
      } catch {
        if (!active) return;

        consecutiveErrors += 1;

        if (consecutiveErrors >= maxConsecutiveErrors) {
          setPollError(
            localizedText(
              locale,
              "Kunde inte kontrollera verifieringen. Ladda om sidan för att försöka igen.",
              "Could not check the verification. Reload the page to try again."
            )
          );
          return;
        }

        setPollError(localizedText(locale, "Kunde inte kontrollera verifieringen. Försöker igen.", "Could not check the verification. Trying again."));
        const delay = Math.min(
          pollIntervalMs * 2 ** consecutiveErrors,
          maxErrorDelayMs
        );
        timeout = setTimeout(poll, delay);
      }
    }

    poll();

    return () => {
      active = false;
      if (timeout) clearTimeout(timeout);
    };
  }, [authRef, flow, locale, localizedHref, refreshUser, router, user]);

  const successText = isFrejaOnlyFlow
    ? localizedText(locale, "Kontot är verifierat. Du skickas vidare till inloggning.", "The account is verified. You will be redirected to sign in.")
    : localizedText(locale, statusMessages.MATCHES.sv, statusMessages.MATCHES.en);
  const statusAction = getStatusAction(status, flow, locale);
  const pageTitle = localizedText(locale, "Verifiera med Freja", "Verify with Freja");
  const pageSubtitle = isFrejaOnlyFlow
    ? useSameDeviceLaunch
      ? localizedText(locale, "Öppna Freja-appen för att skapa kontot.", "Open the Freja app to create the account.")
      : localizedText(locale, "Skanna QR-koden med Freja för att skapa kontot.", "Scan the QR code with Freja to create the account.")
    : useSameDeviceLaunch
      ? localizedText(locale, "Öppna Freja-appen för att verifiera ditt konto.", "Open the Freja app to verify your account.")
      : localizedText(locale, "Skanna QR-koden med Freja för att verifiera ditt konto.", "Scan the QR code with Freja to verify your account.");

  return (
    <AuthCard
      title={isStarting ? localizedText(locale, "Startar Freja", "Starting Freja") : pageTitle}
      subtitle={isStarting ? localizedText(locale, "Vi förbereder verifieringen.", "Preparing the verification.") : pageSubtitle}
      aside={
        <div className="flex h-full flex-col items-center justify-center bg-[#F4F5FA] px-8 text-center">
          <Image
            src={frejaIconPath}
            alt=""
            width={70}
            height={70}
            className="h-[70px] w-[70px]"
            priority
          />
          <Image
            src={frejaLogoPath}
            alt="Freja"
            width={132}
            height={32}
            className="mt-6"
            style={{ width: 132, height: "auto" }}
            priority
          />
        </div>
      }
      footer={
        <FieldDescription className="text-center">
          <Link
            href={statusAction.href}
            className="font-medium text-[#004225] no-underline"
          >
            {statusAction.label}
          </Link>
        </FieldDescription>
      }
    >
      <div className="flex min-h-[340px] min-w-0 flex-col items-center justify-center text-center sm:min-h-[360px]">
        <div className="mb-4 flex w-full items-center justify-center">
          <StatusPill status={status} />
        </div>

        <div className="w-full max-w-[242px] rounded-[8px] border border-slate-200 bg-white p-2 shadow-[0_2px_12px_rgba(15,23,42,0.10)] sm:max-w-[258px] sm:p-4">
          {startError ? (
            <div className="flex aspect-square w-full items-center justify-center p-4">
              <FieldError>{startError}</FieldError>
            </div>
          ) : !authRef ? (
            <div className="flex aspect-square w-full items-center justify-center p-4">
              <FieldError>
                {isStarting
                  ? localizedText(locale, "Startar verifiering...", "Starting verification...")
                  : localizedText(locale, "Verifieringen saknar authRef. Starta registreringen igen.", "The verification is missing authRef. Start registration again.")}
              </FieldError>
            </div>
          ) : useSameDeviceLaunch ? (
            <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 p-4">
              <Button
                as="a"
                href={frejaAuthUrl}
                className="rounded-md"
                aria-label={localizedText(locale, "Öppna Freja", "Open Freja")}
              >
                <Smartphone className="h-4 w-4" />
                {localizedText(locale, "Öppna Freja", "Open Freja")}
              </Button>
              <p className="text-xs leading-5 text-slate-500">
                {localizedText(locale, "Återvänd hit efter godkännande.", "Return here after approval.")}
              </p>
            </div>
          ) : (
            <QRCodeSVG
              value={frejaAuthUrl}
              size={224}
              className="h-auto w-full"
              fgColor="#17142F"
              bgColor="#ffffff"
              level="M"
              marginSize={4}
            />
          )}
        </div>

        <div className="mt-5 min-h-[24px] space-y-2">
          {status !== "PENDING" && (
            <p className="text-sm font-medium text-slate-950">
              {status === "MATCHES"
                ? successText
                : localizedText(locale, statusMessages[status].sv, statusMessages[status].en)}
            </p>
          )}
          {pollError && <FieldError>{pollError}</FieldError>}
        </div>
      </div>
    </AuthCard>
  );
}

export default function FrejaIdRegisterPage() {
  const { locale } = useI18n();

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center overflow-x-hidden p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-sm min-w-0 md:max-w-4xl">
        <Suspense
          fallback={
            <AuthCard
              title={localizedText(locale, "Verifiera med Freja", "Verify with Freja")}
              subtitle={localizedText(locale, "Förbereder verifiering.", "Preparing verification.")}
            />
          }
        >
          <FrejaIdRegisterContent />
        </Suspense>
      </div>
    </div>
  );
}
