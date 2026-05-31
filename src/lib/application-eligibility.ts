import type { User } from "@/types";
import type { Locale } from "@/i18n/config";
import { localizedText } from "@/i18n/text";

type ApplicationTarget = "listing" | "queue";

const targetText: Record<ApplicationTarget, Record<Locale, string>> = {
  listing: {
    sv: "ansöka om bostäder",
    en: "apply for homes",
  },
  queue: {
    sv: "ställa dig i köer",
    en: "join queues",
  },
};

function formatMissingRequirements(requirements: string[], locale: Locale) {
  if (requirements.length <= 1) {
    return requirements[0] ?? "";
  }

  return `${requirements.slice(0, -1).join(", ")} ${localizedText(locale, "och", "and")} ${
    requirements[requirements.length - 1]
  }`;
}

export function getApplicationVerificationError(
  user: User | null | undefined,
  target: ApplicationTarget,
  locale: Locale = "sv",
) {
  if (!user) return null;

  const missingRequirements: string[] = [];
  const verifiedIdentity = user.verifiedIdentity ?? user.verified;

  if (user.verifiedEmail !== true) {
    missingRequirements.push(localizedText(locale, "verifierad e-post", "a verified email address"));
  }

  if (verifiedIdentity !== true) {
    missingRequirements.push(localizedText(locale, "verifierad identitet", "verified identity"));
  }

  if (user.accountType !== "student") {
    missingRequirements.push(localizedText(locale, "studentkonto", "a student account"));
  } else if (user.verifiedStudent !== true) {
    missingRequirements.push(localizedText(locale, "verifierad studentstatus", "verified student status"));
  }

  if (missingRequirements.length === 0) {
    return null;
  }

  return localizedText(
    locale,
    `Du behöver ${formatMissingRequirements(missingRequirements, locale)} för att kunna ${targetText[target].sv}.`,
    `You need ${formatMissingRequirements(missingRequirements, locale)} to ${targetText[target].en}.`,
  );
}
