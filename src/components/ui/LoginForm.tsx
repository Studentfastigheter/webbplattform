"use client";

import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
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
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

type LoginMode = "student" | "company" | "admin";

type LoginFormProps = React.ComponentProps<"div"> & {
  mode?: LoginMode;
};

const loginCopy: Record<
  LoginMode,
  {
    title: string;
    titleEn: string;
    subtitle: string;
    subtitleEn: string;
    invalidAccountMessage: string;
    invalidAccountMessageEn: string;
    successPath: string;
    showGoogle: boolean;
    showRegisterLink: boolean;
  }
> = {
  student: {
    title: "Logga in",
    titleEn: "Log in",
    subtitle: "Endast för studentkonton på CampusLyan.",
    subtitleEn: "For CampusLyan student accounts only.",
    invalidAccountMessage:
      "Det här kontot är inte ett studentkonto. Använd rätt inloggningssida.",
    invalidAccountMessageEn:
      "This account is not a student account. Use the correct sign-in page.",
    successPath: "/",
    showGoogle: true,
    showRegisterLink: true,
  },
  company: {
    title: "Portal-login",
    titleEn: "Portal login",
    subtitle: "Endast för företagskonton.",
    subtitleEn: "For company accounts only.",
    invalidAccountMessage:
      "Det här kontot är inte kopplat till ett företag. Logga in via rätt sida.",
    invalidAccountMessageEn:
      "This account is not linked to a company. Sign in through the correct page.",
    successPath: "/",
    showGoogle: false,
    showRegisterLink: false,
  },
  admin: {
    title: "Superadmin-login",
    titleEn: "Superadmin login",
    subtitle: "Endast för plattformsadministratörer.",
    subtitleEn: "For platform administrators only.",
    invalidAccountMessage:
      "Det här kontot är inte ett superadminkonto.",
    invalidAccountMessageEn:
      "This account is not a superadmin account.",
    successPath: "/",
    showGoogle: false,
    showRegisterLink: false,
  },
};

function isSuperadminAccount(accountType: User["accountType"]) {
  return accountType === "superadmin" || accountType === "admin";
}

function isAllowedAccount(user: User, mode: LoginMode) {
  if (mode === "student") {
    return user.accountType === "student";
  }

  if (mode === "company") {
    return getActiveCompanyId(user) != null && !isSuperadminAccount(user.accountType);
  }

  return isSuperadminAccount(user.accountType);
}

export function LoginForm({ mode = "student", className, ...props }: LoginFormProps) {
  const router = useRouter();
  const { login, adminLogin, googleLogin, logout, isLoading } = useAuth();
  const { locale, localizedHref } = useI18n();
  const baseCopy = loginCopy[mode];
  const copy = {
    ...baseCopy,
    title: localizedText(locale, baseCopy.title, baseCopy.titleEn),
    subtitle: localizedText(locale, baseCopy.subtitle, baseCopy.subtitleEn),
    invalidAccountMessage: localizedText(
      locale,
      baseCopy.invalidAccountMessage,
      baseCopy.invalidAccountMessageEn,
    ),
  };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  function validateForm() {
    const trimmedEmail = email.trim();

    if (!trimmedEmail && !password) {
      return localizedText(locale, "Fyll i e-postadress och lösenord för att logga in.", "Enter your email address and password to sign in.");
    }

    if (!trimmedEmail) {
      return localizedText(locale, "Fyll i e-postadressen som är kopplad till ditt konto.", "Enter the email address connected to your account.");
    }

    if (!isValidEmail(trimmedEmail)) {
      return localizedText(locale, "E-postadressen ser inte korrekt ut. Skriv den i formatet namn@example.com.", "The email address does not look correct. Use the format name@example.com.");
    }

    if (!password) {
      return localizedText(locale, "Fyll i lösenordet för ditt konto.", "Enter the password for your account.");
    }

    return null;
  }

  function handleAuthenticatedUser(user: User) {
    if (!isAllowedAccount(user, mode)) {
      logout();
      setError(copy.invalidAccountMessage);
      return;
    }

    router.replace(localizedHref(copy.successPath));
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
      setError(getAuthErrorMessage(err, "login", locale));
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
      setError(getAuthErrorMessage(err, "google-login", locale));
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
            {localizedText(locale, "Vi laddar dina inställningar ...", "Loading your settings ...")}
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
                label={localizedText(locale, "Fortsätt med Google", "Continue with Google")}
                disabled={isLoading || submitting}
                onCredential={onGoogleCredential}
                onError={setError}
              />

              <FieldSeparator className="my-0 [&_[data-slot=field-separator-content]]:bg-white">
                {localizedText(locale, "Eller", "Or")}
              </FieldSeparator>
            </>
          )}

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
              disabled={isLoading || submitting}
              className="h-14 rounded-[8px] border-transparent bg-[#f2f2f2] px-4 text-base shadow-none placeholder:text-[#7a7a7a] focus-visible:border-[#004225] focus-visible:ring-[#004225]/20"
            />
          </Field>

          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">{localizedText(locale, "Lösenord", "Password")}</FieldLabel>
              {mode === "student" && (
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-[#004225] underline-offset-4 hover:underline"
                >
                  {localizedText(locale, "Glömt ditt lösenord?", "Forgot your password?")}
                </Link>
              )}
            </div>
            <div className="relative">
              <Input
                id="password"
                type={isPasswordVisible ? "text" : "password"}
                placeholder={localizedText(locale, "Skriv ditt lösenord", "Enter your password")}
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
                  {isPasswordVisible
                    ? localizedText(locale, "Dölj lösenord", "Hide password")
                    : localizedText(locale, "Visa lösenord", "Show password")}
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
              {submitting
                ? localizedText(locale, "Loggar in...", "Signing in...")
                : localizedText(locale, "Fortsätt", "Continue")}
            </Button>
          </Field>

          {error && <FieldError>{error}</FieldError>}
        </FieldGroup>
      </form>

      <FieldDescription className="text-center text-xs text-muted-foreground">
        {localizedText(locale, "Genom att logga in godkänner du våra", "By signing in, you accept our")}{" "}
        <Link href="/terms-of-service" className="text-[#004225] underline underline-offset-4">
          {localizedText(locale, "användarvillkor", "terms of use")}
        </Link>{" "}
        {localizedText(locale, "och", "and")}{" "}
        <Link href="/privacy-policy" className="text-[#004225] underline underline-offset-4">
          {localizedText(locale, "integritetspolicy", "privacy policy")}
        </Link>
        .
      </FieldDescription>

      {copy.showRegisterLink && (
        <FieldDescription className="text-center text-sm">
          {localizedText(locale, "Har du inte ett konto?", "Do not have an account?")}{" "}
          <Link href="/register" className="font-medium text-[#004225] no-underline">
            {localizedText(locale, "Skapa ett nu", "Create one now")}
          </Link>
        </FieldDescription>
      )}
    </AuthCard>
  );
}
