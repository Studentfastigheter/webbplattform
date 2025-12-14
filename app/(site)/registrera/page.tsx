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
import { registerUser } from "@/lib/api";
import { type UserType } from "@/types";

type RegisterForm = {
  type: UserType;
  ssn: string;
  email: string;
  password: string;
};

const accountTypeOptions = [
  { value: "student", title: "Student" },
  { value: "private_landlord", title: "Uthyrare" },
  { value: "company", title: "Foretag" },
] satisfies ReadonlyArray<{ value: UserType; title: string }>;

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    type: "student",
    ssn: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.ssn || !form.email || !form.password) {
      setError("Fyll i alla falt.");
      return;
    }
    if (form.password.length < 6) {
      setError("Losenord maste vara minst 6 tecken.");
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        type: form.type,
        ssn: form.ssn.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      await login(form.email, form.password);
      router.push("/");
    } catch (err: any) {
      setError(err?.message ?? "Nagot gick fel.");
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
              <Link href="/logga-in">Logga in har</Link>
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
                <FieldLabel htmlFor="ssn">Personnummer</FieldLabel>
                <Input
                  id="ssn"
                  type="text"
                  placeholder="AAMMDD-XXXX"
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
                <FieldLabel htmlFor="password">Losenord</FieldLabel>
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
