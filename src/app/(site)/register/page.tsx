"use client";

import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/icons";

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
import { cn } from "@/lib/utils";
import { authService } from "@/features/auth/services/auth-service";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";
import { isSiteAuthAccount } from "@/features/auth/lib/account-access";

type RegisterForm = {
  email: string;
  password: string;
  confirmPassword: string;
};

const initialForm: RegisterForm = {
  email: "",
  password: "",
  confirmPassword: "",
};

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

export default function RegisterPage() {
  const router = useRouter();
  const { completeAuth, googleRegister, logout } = useAuth();
  const { locale, localizedHref } = useI18n();
  const passwordRequirements = getPasswordRequirements(locale);
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const passwordStrength = passwordRequirements.map((requirement) => ({
    met: requirement.regex.test(form.password),
    text: requirement.text,
  }));
  const passwordStrengthScore = passwordStrength.filter(
    (requirement) => requirement.met
  ).length;
  const passwordsMatch =
    form.confirmPassword.length > 0 && form.password === form.confirmPassword;

  function updateField(field: keyof RegisterForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validateForm() {
    const email = form.email.trim();
    const password = form.password.trim();
    const confirmPassword = form.confirmPassword.trim();

    if (!email || !password || !confirmPassword) {
      return localizedText(locale, "Fyll i e-postadress och lösenord två gånger för att skapa kontot.", "Enter your email address and password twice to create the account.");
    }

    if (!isValidEmail(email)) {
      return localizedText(locale, "E-postadressen ser inte korrekt ut. Skriv den i formatet namn@example.com.", "The email address does not look correct. Use the format name@example.com.");
    }

    if (password.length < 8) {
      return localizedText(locale, "Lösenordet behöver vara minst 8 tecken långt.", "The password must be at least 8 characters long.");
    }

    const missingRequirements = passwordRequirements.filter(
      (requirement) => !requirement.regex.test(password)
    );

    if (missingRequirements.length > 0) {
      return `${localizedText(locale, "Lösenordet behöver även innehålla", "The password must also contain")} ${missingRequirements
        .map((requirement) => requirement.text.toLowerCase())
        .join(", ")}.`;
    }

    if (password !== confirmPassword) {
      return localizedText(locale, "Lösenorden matchar inte. Skriv samma lösenord i båda fälten.", "The passwords do not match. Enter the same password in both fields.");
    }

    return null;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const response = await authService.quickRegister({
        email: form.email.trim(),
        password: form.password.trim(),
      });
      const user = completeAuth(response);
      if (!isSiteAuthAccount(user)) {
        logout();
        setError(localizedText(locale, "Det här kontot kan inte registreras här.", "This account cannot be registered here."));
        return;
      }
      setForm(initialForm);
      router.replace(localizedHref("/"));
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "register", locale));
    } finally {
      setLoading(false);
    }
  }

  async function onGoogleCredential(googleIdToken: string) {
    if (loading) return;

    setError(null);

    setLoading(true);
    try {
      const user = await googleRegister({
        googleIdToken,
      });
      if (!isSiteAuthAccount(user)) {
        logout();
        setError(localizedText(locale, "Det här kontot kan inte registreras här.", "This account cannot be registered here."));
        return;
      }
      router.replace(localizedHref("/"));
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "google-register", locale));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <AuthCard
          title={localizedText(locale, "Skapa konto", "Create account")}
          footer={
            <FieldDescription className="text-center">
              {localizedText(locale, "Har du redan ett konto?", "Already have an account?")}{" "}
              <Link href="/login" className="font-medium text-[#004225] no-underline">
                {localizedText(locale, "Logga in", "Log in")}
              </Link>
            </FieldDescription>
          }
        >
          <form className="space-y-6" onSubmit={onSubmit}>
            <FieldGroup className="gap-5">
              <div className="grid gap-3">
                <Link
                  href="/register/freja-id?start=freja"
                  className="flex min-h-[48px] w-full items-center justify-center gap-3 rounded-full border border-transparent bg-[#f2f2f2] px-4 text-sm font-semibold text-[#252525] transition-colors hover:bg-[#e8e8e8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004225]"
                  aria-label={localizedText(locale, "Registrera med Freja ID", "Register with Freja ID")}
                >
                  <Image
                    src="/FrejaBrandingPackNew/FrejaBrandingPack/Freja Logo/Freja/SVG/FrejaIndigo.svg"
                    alt=""
                    width={44}
                    height={14}
                    className="h-auto w-11"
                  />
                  <span>{localizedText(locale, "Registrera med Freja ID", "Register with Freja ID")}</span>
                </Link>

                <GoogleAuthButton
                  label={localizedText(locale, "Registrera med Google", "Register with Google")}
                  disabled={loading}
                  onCredential={onGoogleCredential}
                  onError={setError}
                />
              </div>

              <FieldSeparator className="my-0 [&_[data-slot=field-separator-content]]:bg-card">
                {localizedText(locale, "Eller", "Or")}
              </FieldSeparator>

              <Field>
                <FieldLabel htmlFor="email">{localizedText(locale, "E-postadress", "Email address")}</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="namn@example.com"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  autoComplete="email"
                  required
                  disabled={loading}
                  className="h-14 rounded-[8px] border-transparent bg-[#f2f2f2] px-4 text-base shadow-none placeholder:text-[#7a7a7a] focus-visible:border-[#004225] focus-visible:ring-[#004225]/20"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">{localizedText(locale, "Lägg till ett lösenord", "Add a password")}</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={isPasswordVisible ? "text" : "password"}
                    placeholder={localizedText(locale, "Välj ett lösenord", "Choose a password")}
                    value={form.password}
                    onChange={(event) =>
                      updateField("password", event.target.value)
                    }
                    autoComplete="new-password"
                    required
                    disabled={loading}
                    className="h-14 rounded-[8px] border-transparent bg-[#f2f2f2] px-4 pr-12 text-base shadow-none placeholder:text-[#7a7a7a] focus-visible:border-[#004225] focus-visible:ring-[#004225]/20"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setIsPasswordVisible((currentValue) => !currentValue)
                    }
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-black transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004225]"
                    disabled={loading}
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
                  {localizedText(locale, "Bekräfta lösenordet", "Confirm password")}
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={isConfirmPasswordVisible ? "text" : "password"}
                    placeholder={localizedText(locale, "Skriv lösenordet igen", "Enter the password again")}
                    value={form.confirmPassword}
                    onChange={(event) =>
                      updateField("confirmPassword", event.target.value)
                    }
                    autoComplete="new-password"
                    required
                    disabled={loading}
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
                    disabled={loading}
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
                {form.confirmPassword.length > 0 && (
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
                  className="mt-1 h-12 rounded-full bg-[#004225] text-base font-semibold text-white shadow-none hover:bg-[#00351e] disabled:bg-[#c8c8c8] disabled:text-white"
                  disabled={loading}
                >
                  {loading
                    ? localizedText(locale, "Skapar konto...", "Creating account...")
                    : localizedText(locale, "Skapa konto", "Create account")}
                </Button>
              </Field>

              {error && <FieldError>{error}</FieldError>}

            </FieldGroup>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}
