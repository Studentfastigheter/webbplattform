"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

type RegisterForm = {
  firstName: string;
  surname: string;
  email: string;
  password: string;
  ssn: string;
  phone: string;
  city: string;
};

const initialForm: RegisterForm = {
  firstName: "",
  surname: "",
  email: "",
  password: "",
  ssn: "",
  phone: "",
  city: "",
};

const ssnPattern = /^\d{8}-\d{4}$/;

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(field: keyof RegisterForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError(null);

    const payload = {
      firstName: form.firstName.trim(),
      surname: form.surname.trim(),
      email: form.email.trim(),
      password: form.password,
      ssn: form.ssn.trim().replace("-", ""),
      phone: form.phone.trim(),
      city: form.city.trim(),
    };

    if (Object.values(payload).some((value) => !value)) {
      setError("Fyll i alla fält.");
      return;
    }

    if (!ssnPattern.test(form.ssn.trim())) {
      setError("Personnummer måste anges i formatet yyyyMMdd-xxxx.");
      return;
    }

    if (payload.password.length < 6) {
      setError("Lösenord måste vara minst 6 tecken.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({
        accountType: "student",
        ...payload,
      });

      if (!("authRef" in response)) {
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
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <AuthCard
          title="Skapa studentkonto"
          subtitle="Fyll i dina uppgifter och verifiera kontot med Freja."
          footer={
            <FieldDescription className="text-center">
              Har du redan ett konto? <Link href="/logga-in">Logga in här</Link>
            </FieldDescription>
          }
        >
          <form className="space-y-6" onSubmit={onSubmit}>
            <FieldGroup>
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

              <Field>
                <FieldLabel htmlFor="ssn">Personnummer</FieldLabel>
                <Input
                  id="ssn"
                  type="text"
                  placeholder="yyyyMMdd-xxxx"
                  value={form.ssn}
                  onChange={(event) => updateField("ssn", event.target.value)}
                  autoComplete="off"
                  pattern="\d{8}-\d{4}"
                  required
                  disabled={loading}
                />
                <FieldDescription>
                  Ange personnummer i formatet yyyyMMdd-xxxx.
                </FieldDescription>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
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
                </Field>
              </div>

              <Field>
                <Button type="submit" fullWidth className="mt-1" disabled={loading}>
                  {loading ? "Startar verifiering..." : "Skapa konto och verifiera"}
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
