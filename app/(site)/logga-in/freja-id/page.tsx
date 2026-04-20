"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

import { AuthCard } from "@/components/ui/AuthCard";
import { FieldDescription } from "@/components/ui/field";

const temporaryAuthRef = "TEMP_LOGIN_AUTH_REF";

function buildFrejaAuthUrl(authRef: string) {
  const url = new URL("https://app.test.frejaeid.com/freja");

  url.searchParams.set("action", "bindUserToTransaction");
  url.searchParams.set("transactionReference", authRef);

  return url.toString();
}

export default function FrejaIdLoginPage() {
  const frejaAuthUrl = buildFrejaAuthUrl(temporaryAuthRef);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <AuthCard
          title="Logga in med Freja"
          subtitle="Skanna koden med Freja för att fortsätta."
          footer={
            <FieldDescription className="text-center">
              <Link href="/logga-in">Tillbaka till inloggning</Link>
            </FieldDescription>
          }
        >
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
                Autentisering startad
              </p>
              <p className="text-sm text-muted-foreground">
                Tillfällig referens: {temporaryAuthRef}
              </p>
            </div>
          </div>
        </AuthCard>
      </div>
    </div>
  );
}
