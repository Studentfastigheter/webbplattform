"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({ ssn: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // enkel client-validering
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
        // läs fel från backend (GlobalExceptionHandler/validering)
        const data = await res.json().catch(() => ({}));
        const msg =
          data?.error ||
          data?.message ||
          (res.status === 409
            ? "E-post eller personnummer används redan."
            : "Kunde inte registrera användaren.");
        throw new Error(msg);
      }

      const user = await res.json();
      setSuccess(`Konto skapat! Användar-ID: ${user.id}`);
      setForm({ ssn: "", email: "", password: "" });
    } catch (err: any) {
      setError(err.message ?? "Något gick fel.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1 style={{ marginBottom: 16 }}>Skapa konto</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Personnummer (SSN)
          <input
            type="text"
            placeholder="ÅÅÅÅMMDDXXXX"
            value={form.ssn}
            onChange={(e) => setForm({ ...form, ssn: e.target.value.trim() })}
            required
          />
        </label>

        <label>
          E-post
          <input
            type="email"
            placeholder="namn@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>

        <label>
          Lösenord
          <input
            type="password"
            placeholder="Minst 6 tecken"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Skapar..." : "Registrera"}
        </button>
      </form>

      {error && (
        <p style={{ color: "crimson", marginTop: 12 }} role="alert">
          {error}
        </p>
      )}
      {success && (
        <p style={{ color: "green", marginTop: 12 }} role="status">
          {success}
        </p>
      )}
    </main>
  );
}