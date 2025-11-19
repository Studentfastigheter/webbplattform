"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";

import { useAuth } from "@/context/AuthContext";
import { LoginForm } from "@/components/ui/LoginForm";
import { Form, FormError, FormField } from "@/components/ui/form";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { login, ready } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    setErr(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (e: any) {
      setErr(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <LoginForm
        title="Logga in"
        subtitle="Vi laddar in dina inställningar"
        switchButtonLabel="Skapa konto"
        switchLinkHref="/registrera"
      >
        <div className="text-center text-sm text-neutral-500">Laddar...</div>
      </LoginForm>
    );
  }

  return (
    <LoginForm
      title="Logga in"
      subtitle="Hantera dina köplatser och sparade objekt på ett och samma ställe."
      switchTitle="Ny på CampusLyan?"
      switchDescription="Skapa ett gratis konto och börja samla dina bostadssökningar."
      switchButtonLabel="Skapa konto"
      switchLinkHref="/registrera"
      footer={
        <>
          Har du inget konto?{" "}
          <Link href="/registrera" className="font-semibold text-[#004225]">
            Skapa ett gratis konto
          </Link>
        </>
      }
    >
      <Form onSubmit={onSubmit} className="space-y-5">
        <FormField>
          <Label htmlFor="email">E‑post</Label>
          <input
            id="email"
            className="input"
            type="email"
            placeholder="namn@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            placeholder="••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </FormField>
        <Button
          type="submit"
          color="success"
          className="mt-2 w-full font-semibold"
          isDisabled={loading}
          isLoading={loading}
        >
          {loading ? "Loggar in…" : "Logga in"}
        </Button>
        {err && <FormError>{err}</FormError>}
      </Form>
    </LoginForm>
  );
}
