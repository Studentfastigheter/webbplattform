"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { GoogleAuthButton } from "@/features/auth/components/GoogleAuthButton";
import { AuthCard } from "@/components/ui/AuthCard";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { getAuthErrorMessage, isValidEmail } from "@/lib/auth-error-messages";
import { getActiveCompanyId } from "@/lib/company-access";
import type { User } from "@/types";

type LoginMode = "student" | "company" | "admin";

type LoginFormProps = React.ComponentProps<"div"> & {
  mode?: LoginMode;
};

const loginCopy: Record<
  LoginMode,
  {
    title: string;
    subtitle: string;
    invalidAccountMessage: string;
    successPath: string;
    showGoogle: boolean;
    showRegisterLink: boolean;
  }
> = {
  student: {
    title: "Logga in",
    subtitle: "Endast för studentkonton på CampusLyan.",
    invalidAccountMessage:
      "Det här kontot är inte ett studentkonto. Använd rätt inloggningssida.",
    successPath: "/",
    showGoogle: true,
    showRegisterLink: true,
  },
  company: {
    title: "Portal-login",
    subtitle: "Endast för företagskonton.",
    invalidAccountMessage:
      "Det här kontot är inte kopplat till ett företag. Logga in via rätt sida.",
    successPath: "/",
    showGoogle: false,
    showRegisterLink: false,
  },
  admin: {
    title: "Admin-login",
    subtitle: "Endast för administratörskonton.",
    invalidAccountMessage:
      "Det här kontot är inte ett administratörskonto.",
    successPath: "/",
    showGoogle: false,
    showRegisterLink: false,
  },
};

function isAllowedAccount(user: User, mode: LoginMode) {
  if (mode === "student") {
    return user.accountType === "student";
  }

  if (mode === "company") {
    return getActiveCompanyId(user) != null && user.accountType !== "admin";
  }

  return user.accountType === "admin";
}

export function LoginForm({ mode = "student", className, ...props }: LoginFormProps) {
  const router = useRouter();
  const { login, adminLogin, googleLogin, logout, isLoading } = useAuth();
  const copy = loginCopy[mode];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  function validateForm() {
    const trimmedEmail = email.trim();

    if (!trimmedEmail && !password) {
      return "Fyll i e-postadress och lösenord för att logga in.";
    }

    if (!trimmedEmail) {
      return "Fyll i e-postadressen som är kopplad till ditt konto.";
    }

    if (!isValidEmail(trimmedEmail)) {
      return "E-postadressen ser inte korrekt ut. Skriv den i formatet namn@example.com.";
    }

    if (!password) {
      return "Fyll i lösenordet för ditt konto.";
    }

    return null;
  }

  function handleAuthenticatedUser(user: User) {
    if (!isAllowedAccount(user, mode)) {
      logout();
      setError(copy.invalidAccountMessage);
      return;
    }

    router.replace(copy.successPath);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading || submitting) return;

    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const loginAction = mode === "admin" ? adminLogin : login;
      const user = await loginAction({ email: email.trim(), password });
      handleAuthenticatedUser(user);
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "login"));
    } finally {
      setSubmitting(false);
    }
  }

  async function onGoogleCredential(googleIdToken: string) {
    if (isLoading || submitting || !copy.showGoogle) return;

    setError(null);
    setSubmitting(true);
    try {
      const user = await googleLogin({
        googleIdToken,
      });
      handleAuthenticatedUser(user);
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "google-login"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title={copy.title}
      subtitle={copy.subtitle}
      helper={
        isLoading && (
          <p className="text-sm text-muted-foreground">
            Vi laddar dina inställningar ...
          </p>
        )
      }
      className={className}
      {...props}
    >
      <form className="space-y-6" onSubmit={onSubmit}>
        <FieldGroup className="gap-5">
          {copy.showGoogle && (
            <>
              <GoogleAuthButton
                label="Fortsätt med Google"
                disabled={isLoading || submitting}
                onCredential={onGoogleCredential}
                onError={setError}
              />

              <FieldSeparator className="my-0 [&_[data-slot=field-separator-content]]:bg-white">
                Eller
              </FieldSeparator>
            </>
          )}

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
              disabled={isLoading || submitting}
              className="h-14 rounded-[8px] border-transparent bg-[#f2f2f2] px-4 text-base shadow-none placeholder:text-[#7a7a7a] focus-visible:border-[#004225] focus-visible:ring-[#004225]/20"
            />
          </Field>

          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">Lösenord</FieldLabel>
              {mode === "student" && (
                <Link
                  href="/glomt-losenord"
                  className="text-sm font-medium text-[#004225] underline-offset-4 hover:underline"
                >
                  Glömt ditt lösenord?
                </Link>
              )}
            </div>
            <div className="relative">
              <Input
                id="password"
                type={isPasswordVisible ? "text" : "password"}
                placeholder="Skriv ditt lösenord"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                disabled={isLoading || submitting}
                className="h-14 rounded-[8px] border-transparent bg-[#f2f2f2] px-4 pr-12 text-base shadow-none placeholder:text-[#7a7a7a] focus-visible:border-[#004225] focus-visible:ring-[#004225]/20"
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible((currentValue) => !currentValue)}
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-black transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004225]"
                disabled={isLoading || submitting}
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

          <Field>
            <Button
              type="submit"
              fullWidth
              className="h-12 rounded-full bg-[#004225] text-base font-semibold text-white shadow-none hover:bg-[#00351e] disabled:bg-[#c8c8c8] disabled:text-white"
              disabled={isLoading || submitting}
            >
              {submitting ? "Loggar in..." : "Fortsätt"}
            </Button>
          </Field>

          {error && <FieldError>{error}</FieldError>}
        </FieldGroup>
      </form>

      <FieldDescription className="text-center text-xs text-muted-foreground">
        Genom att logga in godkänner du våra{" "}
        <a href="/anvandarvillkor" className="text-[#004225] underline underline-offset-4">
          användarvillkor
        </a>{" "}
        och{" "}
        <a href="/integritetspolicy" className="text-[#004225] underline underline-offset-4">
          integritetspolicy
        </a>
        .
      </FieldDescription>

      {copy.showRegisterLink && (
        <FieldDescription className="text-center text-sm">
          Har du inte ett konto?{" "}
          <Link href="/registrera" className="font-medium text-[#004225] no-underline">
            Skapa ett nu
          </Link>
        </FieldDescription>
      )}
    </AuthCard>
  );
}
