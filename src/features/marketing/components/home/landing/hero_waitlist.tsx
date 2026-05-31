"use client";

import React, { type ChangeEvent, type FormEvent, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { useI18n } from "@/i18n/I18nProvider";

type HeroWaitlistProps = {
  id?: string;
  backgroundClassName?: string;
  heading?: React.ReactNode;
  subtitle?: string;
};

type WaitlistFormValues = {
  email: string;
};

type WaitlistResponse = {
  error?: string;
  alreadyRegistered?: boolean;
};

const waitlistRequestTimeoutMs = 12_000;

const initialWaitlistForm: WaitlistFormValues = {
  email: "",
};

export const HeroWaitlist: React.FC<HeroWaitlistProps> = ({
  id = "register-waitlist",
  backgroundClassName = "bg-background",
  heading,
  subtitle,
}) => {
  const { t } = useI18n();
  const [waitlistForm, setWaitlistForm] = useState<WaitlistFormValues>(initialWaitlistForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);
  const resolvedHeading = heading ?? t("home.waitlist.heading");
  const resolvedSubtitle = subtitle ?? t("home.waitlist.subtitle");

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
    if (!email) return setErrorMessage(t("home.waitlist.errors.missingEmail"));
    if (!emailRegex.test(email)) return setErrorMessage(t("home.waitlist.errors.invalidEmail"));
    if (email.length > 254) return setErrorMessage(t("home.waitlist.errors.tooLong"));

    setIsSubmitting(true);
    const abortController = new AbortController();
    const timeout = window.setTimeout(() => {
      abortController.abort();
    }, waitlistRequestTimeoutMs);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        signal: abortController.signal,
      });

      const payload = (await response.json().catch(() => null)) as WaitlistResponse | null;

      if (!response.ok) {
        throw new Error(payload?.error || t("home.waitlist.errors.registrationFailed"));
      }

      setWaitlistForm(initialWaitlistForm);
      setSuccessMessage(
        payload?.alreadyRegistered
          ? t("home.waitlist.success.alreadyRegistered")
          : t("home.waitlist.success.registered"),
      );
    } catch (error) {
      console.error("Waitlist submit failed", error);
      setErrorMessage(
        error instanceof DOMException && error.name === "AbortError"
          ? t("home.waitlist.errors.timeout")
          : error instanceof Error
            ? error.message
            : t("home.waitlist.errors.generic"),
      );
    } finally {
      window.clearTimeout(timeout);
      setIsSubmitting(false);
    }
  };

  return (
    <section id={id} className={`relative overflow-hidden pb-8 sm:pb-18 md:pb-32 ${backgroundClassName}`}>
      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 text-center sm:mb-12 md:mb-16">
          <h2 className="text-3xl font-bold leading-[1.1] text-foreground sm:text-4xl md:text-6xl">{resolvedHeading}</h2>
          {resolvedSubtitle ? (
            <p className="mx-auto mt-3 max-w-3xl text-sm text-muted-foreground sm:mt-4 sm:text-base md:text-lg">
              {resolvedSubtitle}
            </p>
          ) : null}
        </div>

        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-card p-4 shadow-[0_24px_70px_-45px_rgba(0,0,0,0.35)] sm:rounded-[1.75rem] sm:p-6 md:p-7">
          <form onSubmit={handleWaitlistSubmit}>
            <div>
              <label htmlFor="waitlist-email" className="text-sm font-medium text-foreground">
                {t("home.waitlist.emailLabel")}
              </label>
              <input
                id="waitlist-email"
                name="email"
                type="email"
                required
                value={waitlistForm.email}
                onChange={handleWaitlistChange}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10"
                placeholder={t("home.waitlist.emailPlaceholder")}
                autoComplete="email"
                inputMode="email"
              />
            </div>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t("home.waitlist.privacyPrefix")}{" "}
              <Link
                href="/integritetspolicy"
                className="font-medium text-[#004225] underline underline-offset-4 hover:text-[#00341d]"
              >
                {t("home.waitlist.privacyLink")}
              </Link>
              .
            </p>

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
                  {t("home.waitlist.submitting")}
                </span>
              ) : (
                t("home.waitlist.submit")
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};
