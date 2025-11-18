"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";

export default function RegisterPage() {
  const [form, setForm] = useState({ ssn: "", type:"student", email: "", password: "" });
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
      router.push("/listings");
    } catch (err: any) {
      setError(err.message ?? "Något gick fel.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container-page">
      <section className="section" style={{ maxWidth: 520, margin: '0 auto' }}>
        <h1 className="h1 mb-4">Skapa konto</h1>

        <form onSubmit={onSubmit} className="form card shadow-soft">
          <div className="fieldset">
            <label className="label">Personnummer (SSN)</label>
            <input
              className="input"
              type="text"
              placeholder="ÅÅMMDDXXXX"
              value={form.ssn}
              onChange={(e) => setForm({ ...form, ssn: e.target.value.trim() })}
              required
            />
          </div>

          <div className="fieldset">
            <label className="label">E‑post</label>
            <input
              className="input"
              type="email"
              placeholder="namn@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="fieldset">
            <label className="label">Lösenord</label>
            <input
              className="input"
              type="password"
              placeholder="Minst 6 tecken"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <Button
            type="submit"
            color="success"
            className="mt-2 font-semibold"
            isDisabled={loading}
            isLoading={loading}
          >
            {loading ? "Skapar..." : "Registrera"}
          </Button>

          {error && (
            <p className="subtle" style={{ color: 'crimson' }} role="alert">{error}</p>
          )}
        </form>
      </section>
    </main>
  );
}
