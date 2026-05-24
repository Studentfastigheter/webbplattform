"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import { AuthCard } from "@/components/ui/AuthCard";
import { FieldDescription, FieldError } from "@/components/ui/field";
import { useAuth } from "@/context/AuthContext";
import { authService, isAuthResponse } from "@/services/auth-service";
import type { FrejaAuthStatus } from "@/types";

const pollIntervalMs = 2000;

const frejaAuthStatuses = [
  "PENDING",
  "MATCHES",
  "CLASHING",
  "DISAPPROVED",
  "EXPIRED",
  "CANCELED",
] as const satisfies readonly FrejaAuthStatus[];

const statusMessages: Record<FrejaAuthStatus, string> = {
  PENDING: "Väntar på godkännande i Freja.",
  MATCHES: "Kontot är verifierat. Du kan logga in.",
  CLASHING:
    "Freja-identiteten matchade inte registreringen, eller så finns kontot redan.",
  DISAPPROVED: "Verifieringen nekades i Freja-appen.",
  EXPIRED: "Verifieringen hann löpa ut innan den godkändes.",
  CANCELED: "Verifieringen avbröts.",
};

function isFrejaAuthStatus(value: unknown): value is FrejaAuthStatus {
  return (
    typeof value === "string" &&
    (frejaAuthStatuses as readonly string[]).includes(value)
  );
}

function getStatusAction(status: FrejaAuthStatus) {
  if (status === "MATCHES") {
    return { href: "/logga-in", label: "Gå till inloggning" };
  }

  if (status === "EXPIRED" || status === "CANCELED") {
    return {
      href: "/registrera/freja-id?start=freja",
      label: "Starta Freja igen",
    };
  }

  return { href: "/registrera", label: "Tillbaka till registrering" };
}

function buildFrejaAuthUrl(authRef: string) {
  const url = new URL("https://app.test.frejaeid.com/freja");

  url.searchParams.set("action", "bindUserToTransaction");
  url.searchParams.set("transactionReference", authRef);

  return url.toString();
}

function FrejaIdRegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completeAuth } = useAuth();
  const initialAuthRef = searchParams.get("authRef")?.trim() ?? "";
  const shouldStartFrejaOnly = searchParams.get("start") === "freja";
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
    if (authRef || !shouldStartFrejaOnly) return;

    let active = true;

    async function startFrejaOnlyRegistration() {
      setIsStarting(true);
      setStartError(null);
      try {
        const response = await authService.frejaRegister();
        if (!active) return;
        setAuthRef(response.authRef);
      } catch (err) {
        if (!active) return;
        setStartError(
          err instanceof Error
            ? err.message
            : "Kunde inte starta Freja-registreringen."
        );
      } finally {
        if (active) {
          setIsStarting(false);
        }
      }
    }

    startFrejaOnlyRegistration();

    return () => {
      active = false;
    };
  }, [authRef, shouldStartFrejaOnly]);

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
          router.replace("/");
          return;
        }

        if (!isFrejaAuthStatus(result)) {
          setPollError("Backend skickade en okänd Freja-status.");
          return;
        }

        const nextStatus = result;
        setStatus(nextStatus);
        setPollError(null);

        if (nextStatus === "PENDING") {
          timeout = setTimeout(poll, pollIntervalMs);
        }
      } catch {
        if (!active) return;
        setPollError("Kunde inte kontrollera verifieringen. Försöker igen.");
        timeout = setTimeout(poll, pollIntervalMs);
      }
    }

    poll();

    return () => {
      active = false;
      if (timeout) clearTimeout(timeout);
    };
  }, [authRef, completeAuth, router]);

  const isComplete = status !== "PENDING";
  const successText = isFrejaOnlyFlow
    ? "Kontot är verifierat. Ett lösenord skickas till e-postadressen från Freja."
    : statusMessages.MATCHES;
  const statusAction = getStatusAction(status);

  return (
    <AuthCard
      title="Verifiera med Freja"
      subtitle={
        isStarting
          ? "Startar Freja-verifiering."
          : "Skanna koden med Freja för att fortsätta registreringen."
      }
      footer={
        <FieldDescription className="text-center">
          <Link href={statusAction.href}>{statusAction.label}</Link>
        </FieldDescription>
      }
    >
      {startError ? (
        <FieldError>{startError}</FieldError>
      ) : !authRef ? (
        <FieldError>
          {isStarting
            ? "Startar verifiering..."
            : "Verifieringen saknar authRef. Starta registreringen igen."}
        </FieldError>
      ) : (
        <div className="flex flex-col items-center gap-5">
          <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.12)]">
            <QRCodeSVG
              value={frejaAuthUrl}
              size={220}
              fgColor="#111827"
              bgColor="#ffffff"
              level="M"
              marginSize={4}
            />
          </div>

          <div className="space-y-2 text-center">
            <p className="text-sm font-medium text-slate-950">
              {status === "MATCHES" ? successText : statusMessages[status]}
            </p>
            <p className="text-sm text-muted-foreground">
              {isComplete
                ? "Verifieringen är avslutad."
                : "Vi kontrollerar status varannan sekund."}
            </p>
            {pollError && <FieldError>{pollError}</FieldError>}
          </div>
        </div>
      )}
    </AuthCard>
  );
}

export default function FrejaIdRegisterPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <Suspense
          fallback={
            <AuthCard title="Verifiera med Freja" subtitle="Förbereder verifiering." />
          }
        >
          <FrejaIdRegisterContent />
        </Suspense>
      </div>
    </div>
  );
}
