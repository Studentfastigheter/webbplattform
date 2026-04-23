"use client";

import Image from "next/image";
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
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

type LoginFormProps = React.ComponentProps<"div">;

const frejaLogoSrc =
  "/FrejaBrandingPackNew/FrejaBrandingPack/Freja Logo/Freja/SVG/FrejaIndigo.svg";

export function LoginForm({ className, ...props }: LoginFormProps) {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading || submitting) return;

    setError(null);
    setSubmitting(true);
    try {
      const loggedInUser = await login({ email: email.trim(), password });
      router.push(loggedInUser.accountType === "company" ? "/portal" : "/");
    } catch (err: any) {
      setError(err?.message ?? "Något gick fel vid inloggning.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Välkommen tillbaka"
      subtitle="Logga in för att hantera dina köplatser och sparade objekt."
      helper={
        isLoading && (
          <p className="text-sm text-muted-foreground">
            Vi laddar dina inställningar ...
          </p>
        )
      }
      footer={
        <FieldDescription className="text-center">
          Har du inget konto? <Link href="/registrera">Skapa ett gratis konto</Link>
        </FieldDescription>
      }
      className={className}
      {...props}
    >
      <form className="space-y-6" onSubmit={onSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">E-postadress</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="namn@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              disabled={isLoading || submitting}
            />
          </Field>

          <Field>
            <div className="flex items-center">
              <FieldLabel htmlFor="password">Lösenord</FieldLabel>
              <Link
                href="#"
                className="ml-auto text-sm underline-offset-2 hover:underline"
              >
                Glömt lösenord?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              disabled={isLoading || submitting}
            />
          </Field>

          <Field>
            <Button
              type="submit"
              fullWidth
              className="mt-1"
              disabled={isLoading || submitting}
            >
              {submitting ? "Loggar in..." : "Logga in"}
            </Button>
          </Field>

          {error && <FieldError>{error}</FieldError>}

          <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
            Eller fortsätt med
          </FieldSeparator>

          <Field>
            <Link
              href="/logga-in/freja-id"
              className="flex min-h-[64px] w-full items-center gap-4 rounded-[8px] border border-slate-200 bg-white px-6 text-left shadow-[0_2px_12px_rgba(15,23,42,0.12)] transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3E3A93]"
              aria-label="Logga in med Freja ID"
            >
              <Image
                src={frejaLogoSrc}
                alt=""
                width={38}
                height={10}
                className="h-auto w-[38px]"
              />
              <span className="text-base font-medium text-slate-950">
                Freja ID
              </span>
            </Link>
          </Field>
        </FieldGroup>
      </form>

      <FieldDescription className="text-center text-xs text-muted-foreground">
        Genom att logga in godkänner du våra{" "}
        <a href="/anvandarvillkor" className="underline underline-offset-4">
          användarvillkor
        </a>{" "}
        och{" "}
        <a href="/integritetspolicy" className="underline underline-offset-4">
          integritetspolicy
        </a>
        .
      </FieldDescription>
    </AuthCard>
  );
}
