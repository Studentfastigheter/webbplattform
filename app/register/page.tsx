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
          (data as any)?.error ||
          (data as any)?.message ||
          (res.status === 409 ? "E-post eller personnummer används redan." : "Kunde inte registrera användaren.");
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

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Skapar..." : "Registrera"}
          </button>

          {error && (
            <p className="subtle" style={{ color: 'crimson' }} role="alert">{error}</p>
          )}
          {success && (
            <p className="text-brand" role="status">{success}</p>
          )}
        </form>
      </section>
    </main>
  );
}

