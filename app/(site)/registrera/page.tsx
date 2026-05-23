"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import {
  authService,
  isStudentRegistrationResponse,
} from "@/services/auth-service";
import type { AccountType } from "@/types";

type RegisterForm = {
  firstName: string;
  surname: string;
  email: string;
  password: string;
  ssn: string;
  phone: string;
  city: string;
  companyName: string;
  fullName: string;
};

const initialForm: RegisterForm = {
  firstName: "",
  surname: "",
  email: "",
  password: "",
  ssn: "",
  phone: "",
  city: "",
  companyName: "",
  fullName: "",
};

const accountLabels: Record<AccountType, string> = {
  student: "Student",
  company: "Företag",
  private_landlord: "Privat uthyrare",
};

const ssnPattern = /^(\d{8}-?\d{4}|\d{12})$/;

function normalizeCity(city: string) {
  return city.trim().toLocaleUpperCase("sv-SE");
}

function redirectPathForAccountType(accountType: AccountType) {
  if (accountType === "company") return "/portal";
  if (accountType === "private_landlord") return "/mina-annonser";
  return "/";
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [accountType, setAccountType] = useState<AccountType>("student");
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(field: keyof RegisterForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validateBaseFields() {
    if (!form.email.trim() || !form.password || !form.city.trim()) {
      return "Fyll i e-postadress, lösenord och stad.";
    }

    if (form.password.length < 6) {
      return "Lösenord måste vara minst 6 tecken.";
    }

    return null;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError(null);

    const baseError = validateBaseFields();
    if (baseError) {
      setError(baseError);
      return;
    }

    const basePayload = {
      accountType,
      email: form.email.trim(),
      password: form.password,
      city: normalizeCity(form.city),
    };

    if (accountType === "student") {
      if (!form.firstName.trim() || !form.surname.trim()) {
        setError("Fyll i förnamn och efternamn.");
        return;
      }

      setLoading(true);
      try {
        const response = await authService.register({
          ...basePayload,
          firstName: form.firstName.trim(),
          surname: form.surname.trim(),
        });

        if (!isStudentRegistrationResponse(response)) {
          setError("Registreringen startade inte Freja-verifieringen.");
          return;
        }

        router.push(
          `/registrera/freja-id?authRef=${encodeURIComponent(response.authRef)}`
        );
      } catch (err: any) {
        setError(err?.message ?? "Kunde inte skapa konto. Kontrollera uppgifterna.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (accountType === "company" && (!form.companyName.trim() || !form.phone.trim())) {
      setError("Fyll i företagsnamn och telefonnummer.");
      return;
    }

    if (accountType === "private_landlord") {
      if (!form.fullName.trim() || !form.phone.trim() || !form.ssn.trim()) {
        setError("Fyll i namn, personnummer och telefonnummer.");
        return;
      }

      if (!ssnPattern.test(form.ssn.trim())) {
        setError("Personnummer måste anges som yyyyMMdd-xxxx eller yyyyMMddxxxx.");
        return;
      }
    }

    setLoading(true);
    try {
      const loggedInUser = await register({
        ...basePayload,
        phone: form.phone.trim(),
        companyName:
          accountType === "company" ? form.companyName.trim() : undefined,
        fullName:
          accountType === "private_landlord" ? form.fullName.trim() : undefined,
        ssn:
          accountType === "private_landlord"
            ? form.ssn.trim().replace("-", "")
            : undefined,
      });

      router.push(redirectPathForAccountType(loggedInUser.accountType));
    } catch (err: any) {
      setError(err?.message ?? "Kunde inte skapa konto. Kontrollera uppgifterna.");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogleCredential(googleIdToken: string) {
    if (loading) return;

    setError(null);

    if (!form.city.trim()) {
      setError("Ange stad innan du fortsätter med Google.");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.googleRegister({
        googleIdToken,
        city: normalizeCity(form.city),
      });
      router.push(
        `/registrera/freja-id?authRef=${encodeURIComponent(
          response.authRef
        )}&flow=google`
      );
    } catch (err: any) {
      setError(err?.message ?? "Kunde inte starta Google-registreringen.");
    } finally {
      setLoading(false);
    }
  }

  const isStudent = accountType === "student";
  const isCompany = accountType === "company";
  const isPrivateLandlord = accountType === "private_landlord";

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <AuthCard
          title="Skapa konto"
          subtitle="Välj kontotyp och fyll i uppgifterna för att komma igång."
          footer={
            <FieldDescription className="text-center">
              Har du redan ett konto? <Link href="/logga-in">Logga in här</Link>
            </FieldDescription>
          }
        >
          <form className="space-y-6" onSubmit={onSubmit}>
            <FieldGroup>
              <Tabs
                value={accountType}
                onValueChange={(value) => setAccountType(value as AccountType)}
              >
                <TabsList className="grid h-auto w-full grid-cols-3 rounded-md">
                  {(Object.keys(accountLabels) as AccountType[]).map((type) => (
                    <TabsTrigger key={type} value={type} className="min-h-9">
                      {accountLabels[type]}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <div className="grid gap-4 sm:grid-cols-2">
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
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Lösenord</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minst 6 tecken"
                    value={form.password}
                    onChange={(event) =>
                      updateField("password", event.target.value)
                    }
                    autoComplete="new-password"
                    required
                    disabled={loading}
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="city">Stad</FieldLabel>
                <Input
                  id="city"
                  type="text"
                  value={form.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  autoComplete="address-level2"
                  required
                  disabled={loading}
                />
                <FieldDescription>
                  Skickas till API:t i backendens stadsformat.
                </FieldDescription>
              </Field>

              {isStudent && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="firstName">Förnamn</FieldLabel>
                      <Input
                        id="firstName"
                        type="text"
                        value={form.firstName}
                        onChange={(event) =>
                          updateField("firstName", event.target.value)
                        }
                        autoComplete="given-name"
                        required
                        disabled={loading}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="surname">Efternamn</FieldLabel>
                      <Input
                        id="surname"
                        type="text"
                        value={form.surname}
                        onChange={(event) =>
                          updateField("surname", event.target.value)
                        }
                        autoComplete="family-name"
                        required
                        disabled={loading}
                      />
                    </Field>
                  </div>

                  <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                    Eller registrera student med
                  </FieldSeparator>

                  <Field>
                    <GoogleAuthButton
                      label="Registrera med Google"
                      disabled={loading}
                      onCredential={onGoogleCredential}
                      onError={setError}
                    />
                  </Field>

                  <FieldDescription>
                    Google- och studentregistrering slutförs med Freja.
                    Personnummer och telefon hämtas från Freja när verifieringen
                    är godkänd.
                  </FieldDescription>
                </>
              )}

              {isCompany && (
                <>
                  <Field>
                    <FieldLabel htmlFor="companyName">Företagsnamn</FieldLabel>
                    <Input
                      id="companyName"
                      type="text"
                      value={form.companyName}
                      onChange={(event) =>
                        updateField("companyName", event.target.value)
                      }
                      autoComplete="organization"
                      required
                      disabled={loading}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="phone">Telefonnummer</FieldLabel>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(event) => updateField("phone", event.target.value)}
                      autoComplete="tel"
                      required
                      disabled={loading}
                    />
                  </Field>
                </>
              )}

              {isPrivateLandlord && (
                <>
                  <Field>
                    <FieldLabel htmlFor="fullName">Fullständigt namn</FieldLabel>
                    <Input
                      id="fullName"
                      type="text"
                      value={form.fullName}
                      onChange={(event) =>
                        updateField("fullName", event.target.value)
                      }
                      autoComplete="name"
                      required
                      disabled={loading}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="ssn">Personnummer</FieldLabel>
                      <Input
                        id="ssn"
                        type="text"
                        placeholder="yyyyMMdd-xxxx"
                        value={form.ssn}
                        onChange={(event) => updateField("ssn", event.target.value)}
                        autoComplete="off"
                        required
                        disabled={loading}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="phonePrivate">
                        Telefonnummer
                      </FieldLabel>
                      <Input
                        id="phonePrivate"
                        type="tel"
                        value={form.phone}
                        onChange={(event) =>
                          updateField("phone", event.target.value)
                        }
                        autoComplete="tel"
                        required
                        disabled={loading}
                      />
                    </Field>
                  </div>
                </>
              )}

              <Field>
                <Button type="submit" fullWidth className="mt-1" disabled={loading}>
                  {loading
                    ? "Skapar konto..."
                    : isStudent
                      ? "Skapa konto och verifiera"
                      : "Skapa konto"}
                </Button>
              </Field>

              {isStudent && (
                <FieldDescription className="text-center">
                  Vill du registrera helt via Freja?{" "}
                  <Link href="/registrera/freja-id?start=freja">
                    Starta Freja-registrering
                  </Link>
                </FieldDescription>
              )}

              {error && <FieldError>{error}</FieldError>}
            </FieldGroup>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}
