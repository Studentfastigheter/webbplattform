"use client";

import Link from "next/link";
import Image from "next/image";
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
import { cn } from "@/lib/utils";
import { authService } from "@/features/auth/services/auth-service";

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

export default function RegisterPage() {
  const router = useRouter();
  const { completeAuth, googleRegister } = useAuth();
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
      return "Fyll i e-postadress och lösenord två gånger för att skapa kontot.";
    }

    if (!isValidEmail(email)) {
      return "E-postadressen ser inte korrekt ut. Skriv den i formatet namn@example.com.";
    }

    if (password.length < 8) {
      return "Lösenordet behöver vara minst 8 tecken långt.";
    }

    const missingRequirements = passwordRequirements.filter(
      (requirement) => !requirement.regex.test(password)
    );

    if (missingRequirements.length > 0) {
      return `Lösenordet behöver även innehålla ${missingRequirements
        .map((requirement) => requirement.text.toLowerCase())
        .join(", ")}.`;
    }

    if (password !== confirmPassword) {
      return "Lösenorden matchar inte. Skriv samma lösenord i båda fälten.";
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
      completeAuth(response);
      setForm(initialForm);
      router.replace("/");
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "register"));
    } finally {
      setLoading(false);
    }
  }

  async function onGoogleCredential(googleIdToken: string) {
    if (loading) return;

    setError(null);

    setLoading(true);
    try {
      await googleRegister({
        googleIdToken,
      });
      router.replace("/");
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "google-register"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <AuthCard
          title="Skapa konto"
          footer={
            <FieldDescription className="text-center">
              Har du redan ett konto?{" "}
              <Link href="/logga-in" className="font-medium text-[#004225] no-underline">
                Logga in
              </Link>
            </FieldDescription>
          }
        >
          <form className="space-y-6" onSubmit={onSubmit}>
            <FieldGroup className="gap-5">
              <div className="grid gap-3">
                <Link
                  href="/registrera/freja-id?start=freja"
                  className="flex min-h-[48px] w-full items-center justify-center gap-3 rounded-full border border-transparent bg-[#f2f2f2] px-4 text-sm font-semibold text-[#252525] transition-colors hover:bg-[#e8e8e8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004225]"
                  aria-label="Registrera med Freja ID"
                >
                  <Image
                    src="/FrejaBrandingPackNew/FrejaBrandingPack/Freja Logo/Freja/SVG/FrejaIndigo.svg"
                    alt=""
                    width={44}
                    height={14}
                    className="h-auto w-11"
                  />
                  <span>Registrera med Freja ID</span>
                </Link>

                <GoogleAuthButton
                  label="Registrera med Google"
                  disabled={loading}
                  onCredential={onGoogleCredential}
                  onError={setError}
                />
              </div>

              <FieldSeparator className="my-0 [&_[data-slot=field-separator-content]]:bg-card">
                Eller
              </FieldSeparator>

              <Field>
                <FieldLabel htmlFor="email">E-postadress</FieldLabel>
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
                <FieldLabel htmlFor="password">Lägg till ett lösenord</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={isPasswordVisible ? "text" : "password"}
                    placeholder="Välj ett lösenord"
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
                  Bekräfta lösenordet
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={isConfirmPasswordVisible ? "text" : "password"}
                    placeholder="Skriv lösenordet igen"
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
                        ? "Dölj lösenord"
                        : "Visa lösenord"}
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
                      ? "Lösenorden matchar."
                      : "Lösenorden matchar inte."}
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
                  {loading ? "Skapar konto..." : "Skapa konto"}
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
