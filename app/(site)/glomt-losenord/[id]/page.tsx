"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

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

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError(null);

    if (!resetId) {
      setError("Återställningslänken saknar ett giltigt id.");
      return;
    }

    if (password.length < 6) {
      setError("Lösenordet måste vara minst 6 tecken.");
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
          className="[&_[data-slot=card-content]]:min-h-[580px] [&_[data-slot=card]]:min-h-[580px]"
          title={hasSubmitted ? "Lösenordet är uppdaterat" : "Välj nytt lösenord"}
          subtitle={
            hasSubmitted
              ? "Du kan nu logga in med ditt nya lösenord."
              : "Skriv in ditt nya lösenord två gånger för att återställa kontot."
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
                  Lösenordet har sparats
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Fortsätt till inloggningen och använd ditt nya lösenord.
                </p>
              </div>
              <Link
                href="/logga-in"
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
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    minLength={6}
                    required
                    disabled={submitting}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">
                    Upprepa nytt lösenord
                  </FieldLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    minLength={6}
                    required
                    disabled={submitting}
                  />
                </Field>

                <Field>
                  <Button type="submit" fullWidth disabled={submitting}>
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
