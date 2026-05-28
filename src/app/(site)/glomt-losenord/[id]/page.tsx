"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

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
import { authService } from "@/features/auth/services/auth-service";

const passwordRequirements = [
  { regex: /.{8,}/, text: "Minst 8 tecken" },
  { regex: /[a-z]/, text: "Minst 1 liten bokstav" },
  { regex: /[A-Z]/, text: "Minst 1 stor bokstav" },
  { regex: /[0-9]/, text: "Minst 1 siffra" },
  {
    regex: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
    text: "Minst 1 specialtecken",
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

function getPasswordStrengthText(score: number) {
  if (score === 0) return "Ange ett lösenord";
  if (score <= 2) return "Svagt lösenord";
  if (score <= 3) return "Medelstarkt lösenord";
  if (score === 4) return "Starkt lösenord";

  return "Mycket starkt lösenord";
}

export default function ResetPasswordPage() {
  const params = useParams<{ id: string }>();
  const resetId = useMemo(() => {
    const rawId = params?.id ?? "";

    try {
      return decodeURIComponent(rawId).trim();
    } catch {
      return rawId.trim();
    }
  }, [params?.id]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
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
      setError("Återställningslänken saknar ett giltigt id.");
      return;
    }

    if (password.length < 8) {
      setError("Lösenordet måste vara minst 8 tecken.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Lösenorden måste vara identiska.");
      return;
    }

    setSubmitting(true);

    try {
      await authService.resetPassword({
        resetId,
        newPassword: password,
      });
      setHasSubmitted(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Kunde inte uppdatera lösenordet."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <AuthCard
          title={hasSubmitted ? "Lösenordet är uppdaterat" : "Välj nytt lösenord"}
          subtitle={
            hasSubmitted
              ? "Du kan nu logga in med ditt nya lösenord."
              : "Skriv in ditt nya lösenord två gånger för att återställa kontot."
          }
          footer={
            <FieldDescription className="text-center">
              <Link
                href="/login"
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
                  Lösenordet har sparats
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Fortsätt till inloggningen och använd ditt nya lösenord.
                </p>
              </div>
              <Link
                href="/login"
                className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-[#004225] px-5 text-sm font-semibold text-white transition hover:bg-[#004225]/90"
              >
                Logga in
              </Link>
            </div>
          ) : (
            <form
              className="flex min-h-[360px] flex-col justify-center"
              onSubmit={onSubmit}
            >
              <FieldGroup className="mx-auto w-full max-w-sm">
                <Field>
                  <FieldLabel htmlFor="password">Nytt lösenord</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={isPasswordVisible ? "text" : "password"}
                      placeholder="Välj ett lösenord"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      required
                      disabled={submitting}
                      className="h-14 rounded-[8px] border-transparent bg-[#f2f2f2] px-4 pr-12 text-base shadow-none placeholder:text-[#7a7a7a] focus-visible:border-[#004225] focus-visible:ring-[#004225]/20"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setIsPasswordVisible((currentValue) => !currentValue)
                      }
                      className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-black transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004225]"
                      disabled={submitting}
                    >
                      {isPasswordVisible ? (
                        <EyeOffIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                      <span className="sr-only">
                        {isPasswordVisible ? "Dölj lösenord" : "Visa lösenord"}
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
                    {getPasswordStrengthText(passwordStrengthScore)}
                  </p>
                </div>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">
                    Upprepa nytt lösenord
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={isConfirmPasswordVisible ? "text" : "password"}
                      placeholder="Skriv lösenordet igen"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      required
                      disabled={submitting}
                      className="h-14 rounded-[8px] border-transparent bg-[#f2f2f2] px-4 pr-12 text-base shadow-none placeholder:text-[#7a7a7a] focus-visible:border-[#004225] focus-visible:ring-[#004225]/20"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setIsConfirmPasswordVisible(
                          (currentValue) => !currentValue
                        )
                      }
                      className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-black transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004225]"
                      disabled={submitting}
                    >
                      {isConfirmPasswordVisible ? (
                        <EyeOffIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                      <span className="sr-only">
                        {isConfirmPasswordVisible
                          ? "Dölj lösenord"
                          : "Visa lösenord"}
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
                        ? "Lösenorden matchar."
                        : "Lösenorden matchar inte."}
                    </FieldDescription>
                  )}
                </Field>

                <Field>
                  <Button
                    type="submit"
                    fullWidth
                    disabled={submitting}
                    className="h-12 rounded-full bg-[#004225] text-base font-semibold text-white shadow-none hover:bg-[#00351e] disabled:bg-[#c8c8c8] disabled:text-white"
                  >
                    {submitting ? "Sparar..." : "Spara nytt lösenord"}
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
