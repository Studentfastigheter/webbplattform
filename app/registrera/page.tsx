"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";

import { useAuth } from "@/context/AuthContext";
import { LoginForm } from "@/components/ui/LoginForm";
import { Form, FormError, FormField, FormHelper } from "@/components/ui/form";
import { Label } from "@/components/ui/label";

type AccountType = "student" | "landlord" | "company";

type RegisterForm = { type: AccountType; ssn: string; email: string; password: string };

const accountTypeOptions: { value: AccountType; title: string; description: string }[] = [
  { value: "student", title: "Student", description: "Få tillgång till bostäder och köer riktade mot studenter." },
  { value: "landlord", title: "Uthyrare", description: "Publicera privata annonser och hantera intresseanmälningar." },
  { value: "company", title: "Företag", description: "Hantera företagsbostäder och administrera flera annonser." },
];

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({ type: "student", ssn: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
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
        // Prefer the `reason` field from the response body if provided
        const data = await res.json().catch(() => ({}));
        const msg =
          (data as any)?.reason ||
          (data as any)?.error ||
          (data as any)?.message ||
          (res.status === 409 ? "E-post eller personnummer används redan." : "Kunde inte registrera användaren.");
        throw new Error(msg);
      }

      // Logga in direkt efter lyckad registrering
      await login(form.email, form.password);
      router.push("/");
    } catch (err: any) {
      setError(err.message ?? "Något gick fel.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoginForm
      title="Skapa ett konto"
      subtitle="Välj kontotyp och få tillgång till de funktioner som passar just dig."
      badge="CampusLyan konto"
      sloganTitle="Redo att komma igång?"
      sloganDescription="Det tar under två minuter att bli redo för att söka, hyra ut eller administrera bostäder."
      switchTitle="Redan medlem?"
      switchDescription="Logga in och fortsätt där du slutade."
      switchButtonLabel="Logga in"
      switchLinkHref="/logga-in"
      footer={
        <>
          Har du redan ett konto?{" "}
          <Link href="/logga-in" className="font-semibold text-[#004225]">
            Logga in här
          </Link>
        </>
      }
    >
      <Form onSubmit={onSubmit} className="space-y-5">
        <FormField>
          <Label>Kontotyp</Label>
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
                  onClick={() => setForm((prev) => ({ ...prev, type: option.value }))}
                  className={`${baseClasses} ${stateClasses}`}
                  aria-pressed={isSelected}
                >
                  <span className="block text-sm font-semibold text-neutral-800">{option.title}</span>
                  <span className="mt-1 block text-xs text-neutral-500">{option.description}</span>
                </button>
              );
            })}
          </div>
        </FormField>

        <FormField>
          <Label htmlFor="ssn">Personnummer (SSN)</Label>
          <input
            id="ssn"
            className="input"
            type="text"
            placeholder="ÅÅMMDDXXXX"
            value={form.ssn}
            onChange={(e) => setForm({ ...form, ssn: e.target.value.trim() })}
            required
            autoComplete="off"
          />
        </FormField>

        <FormField>
          <Label htmlFor="email">E‑post</Label>
          <input
            id="email"
            className="input"
            type="email"
            placeholder="namn@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            autoComplete="email"
          />
        </FormField>

        <FormField>
          <Label htmlFor="password">Lösenord</Label>
          <input
            id="password"
            className="input"
            type="password"
            placeholder="Minst 6 tecken"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            autoComplete="new-password"
          />
          <FormHelper>Du kan alltid byta lösenord senare under kontoinställningar.</FormHelper>
        </FormField>

        <Button
          type="submit"
          color="success"
          className="mt-2 w-full font-semibold"
          isDisabled={loading}
          isLoading={loading}
        >
          {loading ? "Skapar..." : "Registrera"}
        </Button>

        {error && <FormError>{error}</FormError>}
      </Form>
    </LoginForm>
  );
}
