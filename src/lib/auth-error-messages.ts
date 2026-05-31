import { ApiError } from "@/lib/api/client";
import type { Locale } from "@/i18n/config";
import { localizedText } from "@/i18n/text";

export type AuthFeedbackContext =
  | "login"
  | "register"
  | "forgot-password"
  | "google-login"
  | "google-register";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string) {
  return emailPattern.test(value.trim());
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function bodyToText(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(bodyToText).join(" ");

  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map(bodyToText)
      .join(" ");
  }

  return String(value);
}

function hasAny(value: string, patterns: string[]) {
  return patterns.some((pattern) => value.includes(pattern));
}

function getContextFallback(context: AuthFeedbackContext, locale: Locale = "sv") {
  switch (context) {
    case "login":
      return localizedText(locale, "Vi kunde inte logga in med de uppgifterna. Kontrollera e-postadress och lösenord och försök igen.", "We could not sign you in with those details. Check your email address and password and try again.");
    case "register":
      return localizedText(locale, "Vi kunde inte skapa kontot. Kontrollera uppgifterna och försök igen.", "We could not create the account. Check the details and try again.");
    case "forgot-password":
      return localizedText(locale, "Vi kunde inte skicka återställningslänken. Kontrollera e-postadressen och försök igen.", "We could not send the reset link. Check the email address and try again.");
    case "google-login":
      return localizedText(locale, "Google-inloggningen kunde inte slutföras. Försök igen eller logga in med e-post och lösenord.", "Google sign-in could not be completed. Try again or sign in with email and password.");
    case "google-register":
      return localizedText(locale, "Google-registreringen kunde inte slutföras. Försök igen eller skapa konto med e-post.", "Google registration could not be completed. Try again or create an account with email.");
  }
}

function getStatusMessage(status: number, context: AuthFeedbackContext, locale: Locale = "sv") {
  if (status === 429) {
    return localizedText(locale, "Det har gjorts för många försök på kort tid. Vänta en stund och försök igen.", "There have been too many attempts in a short time. Wait a moment and try again.");
  }

  if (status >= 500) {
    return localizedText(locale, "Tjänsten svarar inte som den ska just nu. Försök igen om en stund.", "The service is not responding correctly right now. Try again in a moment.");
  }

  if (context === "login" || context === "google-login") {
    if (status === 401 || status === 403) {
      return localizedText(locale, "E-postadressen eller lösenordet stämmer inte. Kontrollera uppgifterna eller återställ lösenordet om du är osäker.", "The email address or password is incorrect. Check the details or reset your password if you are unsure.");
    }

    if (status === 404) {
      return localizedText(locale, "Vi hittar inget konto med den e-postadressen. Kontrollera stavningen eller skapa ett konto.", "We cannot find an account with that email address. Check the spelling or create an account.");
    }

    if (status === 400 || status === 422) {
      return localizedText(locale, "Kontrollera att e-postadressen är korrekt och att lösenordet är ifyllt.", "Check that the email address is correct and that the password is filled in.");
    }
  }

  if (context === "register" || context === "google-register") {
    if (status === 409) {
      return localizedText(locale, "Det finns redan ett konto med den e-postadressen. Logga in i stället eller återställ lösenordet.", "There is already an account with that email address. Sign in instead or reset the password.");
    }

    if (status === 400 || status === 422) {
      return localizedText(locale, "Kontot kunde inte skapas eftersom någon uppgift saknas eller är felaktig. Kontrollera e-postadress och lösenord.", "The account could not be created because a detail is missing or incorrect. Check the email address and password.");
    }

    if (status === 401 || status === 403) {
      return localizedText(locale, "Registreringen kunde inte genomföras. Försök igen eller välj en annan registreringsmetod.", "Registration could not be completed. Try again or choose another registration method.");
    }
  }

  if (context === "forgot-password") {
    if (status === 404) {
      return localizedText(locale, "Vi hittar inget konto med den e-postadressen. Kontrollera stavningen eller skapa ett konto.", "We cannot find an account with that email address. Check the spelling or create an account.");
    }

    if (status === 400 || status === 422) {
      return localizedText(locale, "Ange en giltig e-postadress så skickar vi instruktioner om kontot finns registrerat.", "Enter a valid email address and we will send instructions if the account is registered.");
    }
  }

  return getContextFallback(context, locale);
}

export function getAuthErrorMessage(
  error: unknown,
  context: AuthFeedbackContext,
  locale: Locale = "sv",
) {
  const message = error instanceof Error ? error.message : "";
  const rawText = `${message} ${
    error instanceof ApiError ? bodyToText(error.body) : ""
  }`;
  const normalized = normalizeText(rawText);

  if (
    hasAny(normalized, [
      "failed to fetch",
      "networkerror",
      "kunde inte na servern",
      "load failed",
    ])
  ) {
    return localizedText(locale, "Vi kunde inte nå servern. Kontrollera uppkopplingen och försök igen.", "We could not reach the server. Check your connection and try again.");
  }

  if (
    hasAny(normalized, [
      "already exists",
      "already registered",
      "duplicate",
      "conflict",
      "finns redan",
      "anvands redan",
      "används redan",
    ])
  ) {
    return localizedText(locale, "Det finns redan ett konto med den e-postadressen. Logga in i stället eller återställ lösenordet.", "There is already an account with that email address. Sign in instead or reset the password.");
  }

  if (
    hasAny(normalized, [
      "not verified",
      "unverified",
      "verify email",
      "email verification",
      "inte verifier",
      "verifiera e-post",
    ])
  ) {
    return localizedText(locale, "Kontot är inte verifierat än. Kontrollera din inkorg och följ verifieringslänken innan du loggar in.", "The account is not verified yet. Check your inbox and follow the verification link before signing in.");
  }

  if (
    hasAny(normalized, [
      "disabled",
      "blocked",
      "suspended",
      "avstang",
      "blockerad",
      "inaktiverad",
    ])
  ) {
    return localizedText(locale, "Kontot kan inte användas just nu. Kontakta support om du tror att det här är fel.", "The account cannot be used right now. Contact support if you think this is wrong.");
  }

  if (
    context === "login" &&
    hasAny(normalized, [
      "bad credentials",
      "invalid credentials",
      "wrong password",
      "incorrect password",
      "unauthorized",
      "ogiltiga inloggningsuppgifter",
    ])
  ) {
    return localizedText(locale, "E-postadressen eller lösenordet stämmer inte. Kontrollera uppgifterna eller återställ lösenordet om du är osäker.", "The email address or password is incorrect. Check the details or reset your password if you are unsure.");
  }

  if (
    hasAny(normalized, [
      "invalid email",
      "email invalid",
      "not a valid email",
      "ogiltig e-post",
      "e-postadress",
    ]) &&
    !hasAny(normalized, ["password", "losenord", "lösenord"])
  ) {
    return localizedText(locale, "E-postadressen ser inte korrekt ut. Kontrollera stavningen och försök igen.", "The email address does not look correct. Check the spelling and try again.");
  }

  if (
    context === "register" &&
    hasAny(normalized, ["password", "losenord", "lösenord"])
  ) {
    return localizedText(locale, "Lösenordet uppfyller inte kraven. Använd minst 8 tecken med stor bokstav, liten bokstav, siffra och specialtecken.", "The password does not meet the requirements. Use at least 8 characters with uppercase, lowercase, number and special character.");
  }

  if (error instanceof ApiError) {
    return getStatusMessage(error.status, context, locale);
  }

  return message || getContextFallback(context, locale);
}
