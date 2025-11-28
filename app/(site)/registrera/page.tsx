"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { AuthCard } from "@/components/ui/AuthCard";
import { Button } from "@heroui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type AccountType = "student" | "landlord" | "company";

type RegisterForm = {
  type: AccountType;
  ssn: string;
  email: string;
  password: string;
};

const accountTypeOptions: {
  value: AccountType;
  title: string;
}[] = [
  {
    value: "student",
    title: "Student",
  },
  {
    value: "landlord",
    title: "Uthyrare",
  },
  {
    value: "company",
    title: "Företag",
  },
];

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
      setError("Fyll i alla fält.");
      return;
    }
    if (form.password.length < 6) {
      setError("Lösenord måste vara minst 6 tecken.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg =
          (data as any)?.reason ||
          (data as any)?.error ||
          (data as any)?.message ||
          (res.status === 409
            ? "E-post eller personnummer används redan."
            : "Kunde inte registrera användaren.");
        throw new Error(msg);
      }

      await login(form.email, form.password);
      router.push("/");
    } catch (err: any) {
      setError(err?.message ?? "Något gick fel.");
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
                <Button type="submit" color="success" variant="solid" radius="full" className="mt-1 w-full justify-center text-white bg-[#004225] hover:bg-[#004225]/90" disabled={loading}>
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
