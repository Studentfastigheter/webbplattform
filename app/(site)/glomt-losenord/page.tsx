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
import type { PasswordResetAccountType } from "@/types";

const accountTypeOptions: Array<{
  value: PasswordResetAccountType;
  label: string;
}> = [
  { value: "student", label: "Student" },
  { value: "quick_register", label: "Ej färdig studentregistrering" },
  { value: "company", label: "Företagskonto" },
  { value: "landlord", label: "Privat hyresvärd" },
];

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [accountType, setAccountType] =
    useState<PasswordResetAccountType>("student");
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
        accountType,
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
          title={hasSubmitted ? "Kolla din inbox" : "Glömt lösenord"}
          subtitle={
            hasSubmitted
              ? "Vi har skickat instruktioner till e-postadressen om ett konto finns registrerat."
              : "Ange din e-postadress så skickar vi instruktioner för att återställa lösenordet."
          }
          footer={
            <FieldDescription className="text-center">
              <Link
                href="/logga-in"
                className="font-medium text-[#004225] no-underline"
              >
                Tillbaka till inloggning
              </Link>
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
                  <FieldLabel htmlFor="email">E-post</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="namn@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                    disabled={submitting}
                    className="h-14 rounded-[8px] border-transparent bg-[#f2f2f2] px-4 text-base shadow-none placeholder:text-[#7a7a7a] focus-visible:border-[#004225] focus-visible:ring-[#004225]/20"
                  />
                  <FieldDescription>
                    Vi skickar instruktioner om e-postadressen finns registrerad.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="accountType">Kontotyp</FieldLabel>
                  <select
                    id="accountType"
                    value={accountType}
                    onChange={(event) =>
                      setAccountType(event.target.value as PasswordResetAccountType)
                    }
                    disabled={submitting}
                    className="h-14 rounded-[8px] border border-transparent bg-[#f2f2f2] px-4 text-base shadow-none outline-none focus-visible:border-[#004225] focus-visible:ring-2 focus-visible:ring-[#004225]/20"
                  >
                    {accountTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field>
                  <Button
                    type="submit"
                    fullWidth
                    disabled={submitting}
                    className="h-12 rounded-full bg-[#004225] text-base font-semibold text-white shadow-none hover:bg-[#00351e] disabled:bg-[#c8c8c8] disabled:text-white"
                  >
                    {submitting ? "Skickar..." : "Fortsätt"}
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
