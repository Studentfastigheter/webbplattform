"use client";

import Link from "next/link";
import { useState } from "react";

import { AuthCard } from "@/components/ui/AuthCard";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth-service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);

    try {
      await authService.startPasswordReset({
        userEmail: email,
        accountType: "student",
      });
      setHasSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Kunde inte skicka återställningslänken."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <AuthCard
          className="[&_[data-slot=card-content]]:min-h-[580px] [&_[data-slot=card]]:min-h-[580px]"
          title={hasSubmitted ? "Kolla din inbox" : "Glömt lösenord"}
          subtitle={
            hasSubmitted
              ? "Vi har skickat instruktioner till e-postadressen om ett studentkonto finns registrerat."
              : "Skriv in e-postadressen för ditt studentkonto så skickar vi en återställningslänk."
          }
          footer={
            <FieldDescription className="text-center">
              <Link href="/logga-in">Tillbaka till inloggning</Link>
            </FieldDescription>
          }
        >
          {hasSubmitted ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
              <div className="max-w-sm space-y-2">
                <p className="text-base font-semibold text-[#004225]">
                  Återställningslänken är skickad
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Öppna din inkorg och följ länken i mailet för att välja ett
                  nytt lösenord.
                </p>
              </div>
              <div className="mt-6 w-full max-w-sm rounded-lg border border-black/10 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                Kontrollera skräpposten om mailet inte dyker upp inom några
                minuter.
              </div>
            </div>
          ) : (
            <form
              className="flex min-h-[360px] flex-col justify-center"
              onSubmit={onSubmit}
            >
              <FieldGroup className="mx-auto w-full max-w-sm">
                <Field>
                  <FieldLabel htmlFor="email">E-postadress</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                    disabled={submitting}
                  />
                  <FieldDescription>
                    Återställning skickas endast för studentkonton.
                  </FieldDescription>
                </Field>

                <Field>
                  <Button type="submit" fullWidth disabled={submitting}>
                    {submitting ? "Skickar..." : "Skicka återställningslänk"}
                  </Button>
                </Field>

                {error && <FieldError>{error}</FieldError>}
              </FieldGroup>
            </form>
          )}
        </AuthCard>
      </div>
    </div>
  );
}
