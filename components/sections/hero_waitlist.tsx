"use client";

import React, { type ChangeEvent, type FormEvent, useMemo, useState } from "react";
import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionBadge } from "@/components/ui/section-badge";
import { db, isFirebaseConfigured } from "@/lib/firebase";

type HeroWaitlistProps = {
  id?: string;
  backgroundClassName?: string;
  badge?: string;
  heading?: React.ReactNode;
  subtitle?: string;
};

type WaitlistFormValues = {
  email: string;
};

const initialWaitlistForm: WaitlistFormValues = {
  email: "",
};

function getWaitlistErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code: unknown }).code)
      : "";

  if (code === "permission-denied") {
    return "E-postadressen finns redan registrerad, du kan vara lugn.";
  }
  if (code === "unavailable") {
    return "Servern är tillfälligt otillgängligt. Försök igen om en stund.";
  }
  return "Något gick fel vid registreringen. Försök igen.";
}

export const HeroWaitlist: React.FC<HeroWaitlistProps> = ({
  id = "register-waitlist",
  backgroundClassName = "bg-background",
  badge = "Väntelistan",
  heading = "Redo att hitta din nästa lya?",
  subtitle = "Anmäl dig till väntelistan så får du ett mail så fort vi lanserar.",
}) => {
  const [waitlistForm, setWaitlistForm] = useState<WaitlistFormValues>(initialWaitlistForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

  const handleWaitlistChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const key = name as keyof WaitlistFormValues;
    setWaitlistForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleWaitlistSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const email = waitlistForm.email.trim().toLowerCase();
    if (!email) return setErrorMessage("Ange en e-postadress.");
    if (!emailRegex.test(email)) return setErrorMessage("Ange en giltig e-postadress.");
    if (email.length > 254) return setErrorMessage("E-postadressen är för lång.");

    if (!isFirebaseConfigured || !db) {
      return setErrorMessage(
        "Waitlist är inte konfigurerad ännu. Kontakta support för att anmäla dig."
      );
    }

    setIsSubmitting(true);

    try {
      // Use deterministic doc id to avoid list queries and let rules enforce create-only.
      const waitlistDoc = doc(db, "waitlist", encodeURIComponent(email));
      await setDoc(waitlistDoc, {
        Email: email,
        CreatedAt: serverTimestamp(),
      });

      setWaitlistForm(initialWaitlistForm);
      setSuccessMessage("Tack! Du är nu med i väntelistan.");
    } catch (error) {
      console.error("Waitlist submit failed", error);
      setErrorMessage(getWaitlistErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id={id} className={`relative overflow-hidden py-16 sm:py-20 md:py-24 ${backgroundClassName}`}>
      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 text-center sm:mb-12 md:mb-16">
          {badge ? <SectionBadge text={badge} /> : null}
          <h2 className="text-3xl font-bold leading-[1.1] text-foreground sm:text-4xl md:text-6xl">{heading}</h2>
          {subtitle ? (
            <p className="mx-auto mt-3 max-w-3xl text-sm text-muted-foreground sm:mt-4 sm:text-base md:text-lg">{subtitle}</p>
          ) : null}
        </div>

        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-card p-4 shadow-[0_24px_70px_-45px_rgba(0,0,0,0.35)] sm:rounded-[1.75rem] sm:p-6 md:p-7">
          <form onSubmit={handleWaitlistSubmit}>
            <div>
              <label htmlFor="waitlist-email" className="text-sm font-medium text-foreground">
                E-post
              </label>
              <input
                id="waitlist-email"
                name="email"
                type="email"
                required
                value={waitlistForm.email}
                onChange={handleWaitlistChange}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10"
                placeholder="namn@epost.se"
                autoComplete="email"
                inputMode="email"
              />
            </div>

            <div aria-live="polite" className="mt-4 space-y-2">
              {errorMessage && (
                <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-700">
                  {errorMessage}
                </p>
              )}
              {successMessage && (
                <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
                  {successMessage}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="default"
              className="mt-4 w-full rounded-xl py-5 text-base sm:py-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Skickar...
                </span>
              ) : (
                "Gå med i väntelistan"
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};
