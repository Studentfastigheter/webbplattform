"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
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
// OBS: Vi använder AccountType från dina nya typer
import { type AccountType } from "@/types"; 

type RegisterForm = {
  type: AccountType;
  ssn: string;
  email: string;
  password: string;
  // Lägg till fält för namn om du vill samla in det direkt vid registrering
  firstName?: string;
  surname?: string;
  fullName?: string;
  companyName?: string;
};

const accountTypeOptions = [
  { value: "student", title: "Student" },
  { value: "private_landlord", title: "Uthyrare" },
  { value: "company", title: "Företag" },
] satisfies ReadonlyArray<{ value: AccountType; title: string }>;

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    type: "student",
    ssn: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Använd register från context istället för att importera service direkt
  // så att state uppdateras korrekt
  const { register } = useAuth();
  const router = useRouter();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.ssn || !form.email || !form.password) {
      setError("Fyll i alla fält.");
      return;
    }
    if (form.password.length < 6) {
      setError("Lösenord måste vara minst 6 tecken.");
      return;
    }

    setLoading(true);
    try {
      // Skicka med accountType och ssn i rätt fält
      await register({
        accountType: form.type, // Viktigt: heter accountType i din DTO
        ssn: form.ssn.trim(),
        email: form.email.trim(),
        password: form.password,
        // Om du lägger till namnfält i formuläret, skicka dem här:
        // firstName: form.firstName, osv.
      });
      
      // useAuth.register() hanterar redan token-sparande och user-state
      router.push("/");
    } catch (err: any) {
      // Visa felmeddelande från backend om det finns
      setError(err?.message ?? "Kunde inte skapa konto. Kontrollera uppgifterna.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <AuthCard
          title="Skapa ett konto"
          footer={
            <FieldDescription className="text-center">
              Har du redan ett konto?{" "}
              <Link href="/logga-in">Logga in här</Link>
            </FieldDescription>
          }
        >
          <form className="space-y-6" onSubmit={onSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel>Kontotyp</FieldLabel>
                <div className="grid gap-3 sm:grid-cols-3">
                  {accountTypeOptions.map((option) => {
                    const isSelected = form.type === option.value;
                    const baseClasses =
                      "rounded-2xl border px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600";
                    const stateClasses = isSelected
                      ? "border-[#004225] bg-green-50 shadow-sm"
                      : "border-neutral-200 hover:border-[#004225]/60";
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, type: option.value }))
                        }
                        className={`${baseClasses} ${stateClasses}`}
                        aria-pressed={isSelected}
                      >
                        <span className="block text-sm font-semibold text-neutral-800">
                          {option.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="ssn">
                  {form.type === "company" ? "Organisationsnummer" : "Personnummer"}
                </FieldLabel>
                <Input
                  id="ssn"
                  type="text"
                  placeholder={form.type === "company" ? "556000-0000" : "ÅÅMMDD-XXXX"}
                  value={form.ssn}
                  onChange={(event) =>
                    setForm({ ...form, ssn: event.target.value.trim() })
                  }
                  autoComplete="off"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">E-postadress</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="namn@example.com"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  autoComplete="email"
                  required
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
                    setForm({ ...form, password: event.target.value })
                  }
                  autoComplete="new-password"
                  required
                />
              </Field>

              <Field>
                <Button type="submit" fullWidth className="mt-1" disabled={loading}>
                  {loading ? "Skapar..." : "Registrera"}
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