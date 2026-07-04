"use client";

import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
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
import { useStartPasswordReset } from "@/features/auth/hooks/useAuthMutations";
import { getAuthErrorMessage, isValidEmail } from "@/lib/auth-error-messages";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

export default function ForgotPasswordPage() {
  const { locale } = useI18n();
  const startReset = useStartPasswordReset();
  const submitting = startReset.isPending;
  const [email, setEmail] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validateForm() {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      return localizedText(locale, "Fyll i e-postadressen som är kopplad till kontot.", "Enter the email address connected to the account.");
    }

    if (!isValidEmail(trimmedEmail)) {
      return localizedText(locale, "E-postadressen ser inte korrekt ut. Skriv den i formatet namn@example.com.", "The email address does not look correct. Use the format name@example.com.");
    }

    return null;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await startReset.mutateAsync({ userEmail: email.trim() });
      setHasSubmitted(true);
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "forgot-password", locale));
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <AuthCard
          title={
            hasSubmitted
              ? localizedText(locale, "Kolla din inbox", "Check your inbox")
              : localizedText(locale, "Glömt lösenord", "Forgot password")
          }
          subtitle={
            hasSubmitted
              ? localizedText(locale, "Vi har skickat instruktioner till e-postadressen om ett konto finns registrerat.", "We have sent instructions to the email address if an account is registered.")
              : localizedText(locale, "Ange din e-postadress så skickar vi instruktioner för att återställa lösenordet.", "Enter your email address and we will send instructions to reset the password.")
          }
          footer={
            <FieldDescription className="text-center">
              <Link
                href="/login"
                className="font-medium text-brand no-underline"
              >
                {localizedText(locale, "Tillbaka till inloggning", "Back to sign-in")}
              </Link>
            </FieldDescription>
          }
        >
          {hasSubmitted ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
              <div className="max-w-sm space-y-2">
                <p className="text-base font-semibold text-brand">
                  {localizedText(locale, "Återställningslänken är skickad", "The reset link has been sent")}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {localizedText(locale, "Öppna din inkorg och följ länken i mailet för att välja ett nytt lösenord.", "Open your inbox and follow the link in the email to choose a new password.")}
                </p>
              </div>
              <div className="mt-6 w-full max-w-sm rounded-lg border border-black/10 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                {localizedText(locale, "Kontrollera skräpposten om mailet inte dyker upp inom några minuter.", "Check your spam folder if the email does not appear within a few minutes.")}
              </div>
            </div>
          ) : (
            <form
              className="flex min-h-[360px] flex-col justify-center"
              onSubmit={onSubmit}
            >
              <FieldGroup className="mx-auto w-full max-w-sm">
                <Field>
                  <FieldLabel htmlFor="email">{localizedText(locale, "E-post", "Email")}</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="namn@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                    disabled={submitting}
                    className="h-14 rounded-[8px] border-transparent bg-[#f2f2f2] px-4 text-base shadow-none placeholder:text-[#7a7a7a] focus-visible:border-brand focus-visible:ring-brand/20"
                  />
                  <FieldDescription>
                    {localizedText(locale, "Vi skickar instruktioner om e-postadressen finns registrerad.", "We will send instructions if the email address is registered.")}
                  </FieldDescription>
                </Field>

                <Field>
                  <Button
                    type="submit"
                    fullWidth
                    disabled={submitting}
                    className="h-12 rounded-full bg-brand text-base font-semibold text-white shadow-none hover:bg-[#00351e] disabled:bg-[#c8c8c8] disabled:text-white"
                  >
                    {submitting
                      ? localizedText(locale, "Skickar...", "Sending...")
                      : localizedText(locale, "Fortsätt", "Continue")}
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
