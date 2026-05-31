"use client";

import Image from "next/image";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2Icon,
  Clock3Icon,
  RefreshCwIcon,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { AuthCard } from "@/components/ui/AuthCard";
import { FieldDescription, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { authService, isAuthResponse } from "@/features/auth/services/auth-service";
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

function isFrejaAuthStatus(value: unknown): value is FrejaAuthStatus {
  return (
    typeof value === "string" &&
    (frejaAuthStatuses as readonly string[]).includes(value)
  );
}

function getStatusAction(status: FrejaAuthStatus, flow: "registration" | "identity", locale: "sv" | "en") {
  if (flow === "identity") {
    return status === "MATCHES"
      ? { href: "/profile", label: localizedText(locale, "Tillbaka till profilen", "Back to profile") }
      : { href: "/profile", label: localizedText(locale, "Tillbaka till profilen", "Back to profile") };
  }

  if (status === "MATCHES") {
    return { href: "/", label: localizedText(locale, "Fortsätt", "Continue") };
  }

  if (status === "EXPIRED" || status === "CANCELED") {
    return {
      href: "/register/freja-id?start=freja",
      label: localizedText(locale, "Starta Freja igen", "Start Freja again"),
    };
  }

  return { href: "/register", label: localizedText(locale, "Tillbaka till registrering", "Back to registration") };
}

function buildFrejaAuthUrl(authRef: string) {
  const url = new URL("https://app.test.frejaeid.com/freja");

  url.searchParams.set("action", "bindUserToTransaction");
  url.searchParams.set("transactionReference", authRef);

  return url.toString();
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
  const { completeAuth, refreshUser } = useAuth();
  const { locale, localizedHref } = useI18n();
  const initialAuthRef = searchParams.get("authRef")?.trim() ?? "";
  const shouldStartFrejaOnly = searchParams.get("start") === "freja";
  const flow = searchParams.get("flow") === "identity" ? "identity" : "registration";
  const isFrejaOnlyFlow =
    shouldStartFrejaOnly || searchParams.get("flow") === "freja";
  const [authRef, setAuthRef] = useState(initialAuthRef);
  const [status, setStatus] = useState<FrejaAuthStatus>("PENDING");
  const [pollError, setPollError] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const frejaAuthUrl = useMemo(
    () => (authRef ? buildFrejaAuthUrl(authRef) : ""),
    [authRef]
  );

  useEffect(() => {
    if (authRef || (!shouldStartFrejaOnly && flow !== "identity")) return;

    let active = true;

    async function startFrejaFlow() {
      setIsStarting(true);
      setStartError(null);
      try {
        const response =
          flow === "identity"
            ? await authService.verifyIdentity()
            : await authService.frejaRegister();
        if (!active) return;
        setAuthRef(response.authRef);
      } catch (err) {
        if (!active) return;
        setStartError(
          err instanceof Error
            ? err.message
            : flow === "identity"
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
  }, [authRef, flow, shouldStartFrejaOnly]);

  useEffect(() => {
    if (!authRef) return;

    let active = true;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    async function poll() {
      try {
        const result = await authService.pollAuthStatus(authRef);
        if (!active) return;

        if (isAuthResponse(result)) {
          completeAuth(result);
          router.replace(localizedHref("/"));
          return;
        }

        if (!isFrejaAuthStatus(result)) {
          setPollError(localizedText(locale, "Backend skickade en okänd Freja-status.", "The backend returned an unknown Freja status."));
          return;
        }

        const nextStatus = result;
        setStatus(nextStatus);
        setPollError(null);

        if (nextStatus === "PENDING") {
          timeout = setTimeout(poll, pollIntervalMs);
        } else if (nextStatus === "MATCHES" && flow === "identity") {
          await refreshUser();
          timeout = setTimeout(() => router.replace(localizedHref("/profile")), 900);
        } else if (nextStatus === "MATCHES") {
          timeout = setTimeout(() => router.replace(localizedHref("/")), 900);
        }
      } catch {
        if (!active) return;
        setPollError(localizedText(locale, "Kunde inte kontrollera verifieringen. Försöker igen.", "Could not check the verification. Trying again."));
        timeout = setTimeout(poll, pollIntervalMs);
      }
    }

    poll();

    return () => {
      active = false;
      if (timeout) clearTimeout(timeout);
    };
  }, [authRef, completeAuth, flow, refreshUser, router]);

  const successText = isFrejaOnlyFlow
    ? localizedText(locale, "Kontot är verifierat. Du skickas vidare till startsidan.", "The account is verified. You will be redirected to the homepage.")
    : flow === "identity"
      ? localizedText(locale, "Identiteten är verifierad.", "Identity verified.")
    : localizedText(locale, statusMessages.MATCHES.sv, statusMessages.MATCHES.en);
  const statusAction = getStatusAction(status, flow, locale);
  const pageTitle =
    flow === "identity"
      ? localizedText(locale, "Verifiera identitet", "Verify identity")
      : localizedText(locale, "Verifiera med Freja", "Verify with Freja");
  const pageSubtitle =
    flow === "identity"
      ? localizedText(locale, "Skanna QR-koden i Freja-appen.", "Scan the QR code in the Freja app.")
      : localizedText(locale, "Skanna QR-koden med Freja.", "Scan the QR code with Freja.");

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
            className="mt-6 h-auto w-[132px]"
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
      <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
        <div className="mb-4 flex w-full items-center justify-center">
          <StatusPill status={status} />
        </div>

        <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.10)]">
          {startError ? (
            <div className="flex h-[224px] w-[224px] items-center justify-center p-4">
              <FieldError>{startError}</FieldError>
            </div>
          ) : !authRef ? (
            <div className="flex h-[224px] w-[224px] items-center justify-center p-4">
              <FieldError>
                {isStarting
                  ? localizedText(locale, "Startar verifiering...", "Starting verification...")
                  : localizedText(locale, "Verifieringen saknar authRef. Starta registreringen igen.", "The verification is missing authRef. Start registration again.")}
              </FieldError>
            </div>
          ) : (
            <QRCodeSVG
              value={frejaAuthUrl}
              size={224}
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
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
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
