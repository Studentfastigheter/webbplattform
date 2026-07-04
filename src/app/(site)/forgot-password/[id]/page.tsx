"use client";

import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/icons";

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
import { cn } from "@/lib/utils";
import { useResetPassword } from "@/features/auth/hooks/useAuthMutations";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

const getPasswordRequirements = (locale: "sv" | "en") => [
  { regex: /.{8,}/, text: localizedText(locale, "Minst 8 tecken", "At least 8 characters") },
  { regex: /[a-z]/, text: localizedText(locale, "Minst 1 liten bokstav", "At least 1 lowercase letter") },
  { regex: /[A-Z]/, text: localizedText(locale, "Minst 1 stor bokstav", "At least 1 uppercase letter") },
  { regex: /[0-9]/, text: localizedText(locale, "Minst 1 siffra", "At least 1 number") },
  {
    regex: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
    text: localizedText(locale, "Minst 1 specialtecken", "At least 1 special character"),
  },
];

function getPasswordStrengthColor(score: number) {
  if (score === 0) return "bg-border";
  if (score <= 1) return "bg-destructive";
  if (score <= 2) return "bg-orange-500";
  if (score <= 3) return "bg-amber-500";
  if (score === 4) return "bg-yellow-400";

  return "bg-green-500";
}

function getPasswordStrengthText(score: number, locale: "sv" | "en") {
  if (score === 0) return localizedText(locale, "Ange ett lösenord", "Enter a password");
  if (score <= 2) return localizedText(locale, "Svagt lösenord", "Weak password");
  if (score <= 3) return localizedText(locale, "Medelstarkt lösenord", "Medium-strength password");
  if (score === 4) return localizedText(locale, "Starkt lösenord", "Strong password");

  return localizedText(locale, "Mycket starkt lösenord", "Very strong password");
}

export default function ResetPasswordPage() {
  const { locale } = useI18n();
  const params = useParams<{ id: string }>();
  const passwordRequirements = getPasswordRequirements(locale);
  const resetId = useMemo(() => {
    const rawId = params?.id ?? "";

    try {
      return decodeURIComponent(rawId).trim();
    } catch {
      return rawId.trim();
    }
  }, [params?.id]);

  const resetPassword = useResetPassword();
  const submitting = resetPassword.isPending;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const passwordStrengthScore = passwordRequirements.filter((requirement) =>
    requirement.regex.test(password)
  ).length;
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError(null);

    if (!resetId) {
      setError(localizedText(locale, "Återställningslänken saknar ett giltigt id.", "The reset link is missing a valid id."));
      return;
    }

    if (password.length < 8) {
      setError(localizedText(locale, "Lösenordet måste vara minst 8 tecken.", "The password must be at least 8 characters."));
      return;
    }

    if (password !== confirmPassword) {
      setError(localizedText(locale, "Lösenorden måste vara identiska.", "The passwords must be identical."));
      return;
    }

    try {
      await resetPassword.mutateAsync({
        resetId,
        newPassword: password,
      });
      setHasSubmitted(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : localizedText(locale, "Kunde inte uppdatera lösenordet.", "Could not update the password.")
      );
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <AuthCard
          title={
            hasSubmitted
              ? localizedText(locale, "Lösenordet är uppdaterat", "The password has been updated")
              : localizedText(locale, "Välj nytt lösenord", "Choose a new password")
          }
          subtitle={
            hasSubmitted
              ? localizedText(locale, "Du kan nu logga in med ditt nya lösenord.", "You can now sign in with your new password.")
              : localizedText(locale, "Skriv in ditt nya lösenord två gånger för att återställa kontot.", "Enter your new password twice to reset the account.")
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
                  {localizedText(locale, "Lösenordet har sparats", "The password has been saved")}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {localizedText(locale, "Fortsätt till inloggningen och använd ditt nya lösenord.", "Continue to sign-in and use your new password.")}
                </p>
              </div>
              <Link
                href="/login"
                className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand/90"
              >
                {localizedText(locale, "Logga in", "Log in")}
              </Link>
            </div>
          ) : (
            <form
              className="flex min-h-[360px] flex-col justify-center"
              onSubmit={onSubmit}
            >
              <FieldGroup className="mx-auto w-full max-w-sm">
                <Field>
                  <FieldLabel htmlFor="password">{localizedText(locale, "Nytt lösenord", "New password")}</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={isPasswordVisible ? "text" : "password"}
                      placeholder={localizedText(locale, "Välj ett lösenord", "Choose a password")}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      required
                      disabled={submitting}
                      className="h-14 rounded-[8px] border-transparent bg-[#f2f2f2] px-4 pr-12 text-base shadow-none placeholder:text-[#7a7a7a] focus-visible:border-brand focus-visible:ring-brand/20"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setIsPasswordVisible((currentValue) => !currentValue)
                      }
                      className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-black transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      disabled={submitting}
                    >
                      {isPasswordVisible ? (
                        <EyeOffIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                      <span className="sr-only">
                        {isPasswordVisible
                          ? localizedText(locale, "Dölj lösenord", "Hide password")
                          : localizedText(locale, "Visa lösenord", "Show password")}
                      </span>
                    </button>
                  </div>
                </Field>

                <div className="-mt-2 space-y-2">
                  <div className="flex h-2 w-full gap-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <span
                        key={index}
                        className={cn(
                          "h-full flex-1 rounded-full transition-all duration-500 ease-out",
                          index < passwordStrengthScore
                            ? getPasswordStrengthColor(passwordStrengthScore)
                            : "bg-[#e7e9ec]"
                        )}
                      />
                    ))}
                  </div>

                  <p className="text-right text-sm font-normal text-[#7a7a7a]">
                    {getPasswordStrengthText(passwordStrengthScore, locale)}
                  </p>
                </div>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">
                    {localizedText(locale, "Upprepa nytt lösenord", "Repeat new password")}
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={isConfirmPasswordVisible ? "text" : "password"}
                      placeholder={localizedText(locale, "Skriv lösenordet igen", "Enter the password again")}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      required
                      disabled={submitting}
                      className="h-14 rounded-[8px] border-transparent bg-[#f2f2f2] px-4 pr-12 text-base shadow-none placeholder:text-[#7a7a7a] focus-visible:border-brand focus-visible:ring-brand/20"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setIsConfirmPasswordVisible(
                          (currentValue) => !currentValue
                        )
                      }
                      className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-black transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      disabled={submitting}
                    >
                      {isConfirmPasswordVisible ? (
                        <EyeOffIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                      <span className="sr-only">
                        {isConfirmPasswordVisible
                          ? localizedText(locale, "Dölj lösenord", "Hide password")
                          : localizedText(locale, "Visa lösenord", "Show password")}
                      </span>
                    </button>
                  </div>
                  {confirmPassword.length > 0 && (
                    <FieldDescription
                      className={cn(
                        passwordsMatch
                          ? "text-green-600 dark:text-green-400"
                          : "text-destructive"
                      )}
                    >
                      {passwordsMatch
                        ? localizedText(locale, "Lösenorden matchar.", "The passwords match.")
                        : localizedText(locale, "Lösenorden matchar inte.", "The passwords do not match.")}
                    </FieldDescription>
                  )}
                </Field>

                <Field>
                  <Button
                    type="submit"
                    fullWidth
                    disabled={submitting}
                    className="h-12 rounded-full bg-brand text-base font-semibold text-white shadow-none hover:bg-[#00351e] disabled:bg-[#c8c8c8] disabled:text-white"
                  >
                    {submitting
                      ? localizedText(locale, "Sparar...", "Saving...")
                      : localizedText(locale, "Spara nytt lösenord", "Save new password")}
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
