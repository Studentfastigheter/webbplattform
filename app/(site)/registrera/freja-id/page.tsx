"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import { AuthCard } from "@/components/ui/AuthCard";
import { FieldDescription, FieldError } from "@/components/ui/field";
import { authService } from "@/services/auth-service";
import type { FrejaAuthStatus } from "@/types";

const pollIntervalMs = 3500;

const statusMessages: Record<FrejaAuthStatus, string> = {
  PENDING: "Väntar på godkännande i Freja.",
  MATCHES: "Kontot är verifierat. Du kan logga in.",
  CLASHING: "Identiteten i Freja matchar inte registreringsuppgifterna.",
  DISAPPROVED: "Verifieringen nekades i Freja.",
  EXPIRED: "Verifieringen hann löpa ut.",
  CANCELED: "Verifieringen avbröts.",
};

function buildFrejaAuthUrl(authRef: string) {
  const url = new URL("https://app.test.frejaeid.com/freja");

  url.searchParams.set("action", "bindUserToTransaction");
  url.searchParams.set("transactionReference", authRef);

  return url.toString();
}

function FrejaIdRegisterContent() {
  const searchParams = useSearchParams();
  const authRef = searchParams.get("authRef")?.trim() ?? "";
  const [status, setStatus] = useState<FrejaAuthStatus>("PENDING");
  const [pollError, setPollError] = useState<string | null>(null);

  const frejaAuthUrl = useMemo(
    () => (authRef ? buildFrejaAuthUrl(authRef) : ""),
    [authRef]
  );

  useEffect(() => {
    if (!authRef) return;

    let active = true;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    async function poll() {
      try {
        const nextStatus = await authService.pollAuthStatus(authRef);
        if (!active) return;

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
  }, [authRef]);

  const isComplete = status !== "PENDING";

  return (
    <AuthCard
      title="Verifiera med Freja"
      subtitle="Skanna koden med Freja för att fortsätta registreringen."
      footer={
        <FieldDescription className="text-center">
          {status === "MATCHES" ? (
            <Link href="/logga-in">Gå till inloggning</Link>
          ) : (
            <Link href="/registrera">Tillbaka till registrering</Link>
          )}
        </FieldDescription>
      }
    >
      {!authRef ? (
        <FieldError>
          Verifieringen saknar authRef. Starta registreringen igen.
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
              {statusMessages[status]}
            </p>
            <p className="text-sm text-muted-foreground">
              {isComplete
                ? "Verifieringen är avslutad."
                : "Vi kontrollerar status var 3,5 sekund."}
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
