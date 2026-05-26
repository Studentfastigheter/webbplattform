import { ApiError } from "@/lib/api/client";

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

function getContextFallback(context: AuthFeedbackContext) {
  switch (context) {
    case "login":
      return "Vi kunde inte logga in med de uppgifterna. Kontrollera e-postadress och lösenord och försök igen.";
    case "register":
      return "Vi kunde inte skapa kontot. Kontrollera uppgifterna och försök igen.";
    case "forgot-password":
      return "Vi kunde inte skicka återställningslänken. Kontrollera e-postadressen och försök igen.";
    case "google-login":
      return "Google-inloggningen kunde inte slutföras. Försök igen eller logga in med e-post och lösenord.";
    case "google-register":
      return "Google-registreringen kunde inte slutföras. Försök igen eller skapa konto med e-post.";
  }
}

function getStatusMessage(status: number, context: AuthFeedbackContext) {
  if (status === 429) {
    return "Det har gjorts för många försök på kort tid. Vänta en stund och försök igen.";
  }

  if (status >= 500) {
    return "Tjänsten svarar inte som den ska just nu. Försök igen om en stund.";
  }

  if (context === "login" || context === "google-login") {
    if (status === 401 || status === 403) {
      return "E-postadressen eller lösenordet stämmer inte. Kontrollera uppgifterna eller återställ lösenordet om du är osäker.";
    }

    if (status === 404) {
      return "Vi hittar inget konto med den e-postadressen. Kontrollera stavningen eller skapa ett konto.";
    }

    if (status === 400 || status === 422) {
      return "Kontrollera att e-postadressen är korrekt och att lösenordet är ifyllt.";
    }
  }

  if (context === "register" || context === "google-register") {
    if (status === 409) {
      return "Det finns redan ett konto med den e-postadressen. Logga in i stället eller återställ lösenordet.";
    }

    if (status === 400 || status === 422) {
      return "Kontot kunde inte skapas eftersom någon uppgift saknas eller är felaktig. Kontrollera e-postadress och lösenord.";
    }

    if (status === 401 || status === 403) {
      return "Registreringen kunde inte genomföras. Försök igen eller välj en annan registreringsmetod.";
    }
  }

  if (context === "forgot-password") {
    if (status === 404) {
      return "Vi hittar inget konto med den e-postadressen. Kontrollera stavningen eller skapa ett konto.";
    }

    if (status === 400 || status === 422) {
      return "Ange en giltig e-postadress så skickar vi instruktioner om kontot finns registrerat.";
    }
  }

  return getContextFallback(context);
}

export function getAuthErrorMessage(
  error: unknown,
  context: AuthFeedbackContext
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
    return "Vi kunde inte nå servern. Kontrollera uppkopplingen och försök igen.";
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
    return "Det finns redan ett konto med den e-postadressen. Logga in i stället eller återställ lösenordet.";
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
    return "Kontot är inte verifierat än. Kontrollera din inkorg och följ verifieringslänken innan du loggar in.";
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
    return "Kontot kan inte användas just nu. Kontakta support om du tror att det här är fel.";
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
    return "E-postadressen eller lösenordet stämmer inte. Kontrollera uppgifterna eller återställ lösenordet om du är osäker.";
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
    return "E-postadressen ser inte korrekt ut. Kontrollera stavningen och försök igen.";
  }

  if (
    context === "register" &&
    hasAny(normalized, ["password", "losenord", "lösenord"])
  ) {
    return "Lösenordet uppfyller inte kraven. Använd minst 8 tecken med stor bokstav, liten bokstav, siffra och specialtecken.";
  }

  if (error instanceof ApiError) {
    return getStatusMessage(error.status, context);
  }

  return message || getContextFallback(context);
}
