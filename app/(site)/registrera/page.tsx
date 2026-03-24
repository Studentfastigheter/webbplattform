"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
import { useAuth } from "@/context/AuthContext";

type RegisterForm = {
  ssn: string;
  email: string;
  password: string;
};

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    ssn: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      await register({
        accountType: "student",
        ssn: form.ssn.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      router.push("/");
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
                <FieldLabel htmlFor="ssn">Personnummer</FieldLabel>
                <Input
                  id="ssn"
                  type="text"
                  placeholder="ÅÅMMDD-XXXX"
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
