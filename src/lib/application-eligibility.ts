import type { User } from "@/types";

type ApplicationTarget = "listing" | "queue";

const targetText: Record<ApplicationTarget, string> = {
  listing: "ansöka om bostäder",
  queue: "ställa dig i köer",
};

function formatMissingRequirements(requirements: string[]) {
  if (requirements.length <= 1) {
    return requirements[0] ?? "";
  }

  return `${requirements.slice(0, -1).join(", ")} och ${
    requirements[requirements.length - 1]
  }`;
}

export function getApplicationVerificationError(
  user: User | null | undefined,
  target: ApplicationTarget
) {
  if (!user) return null;

  const missingRequirements: string[] = [];
  const verifiedIdentity = user.verifiedIdentity ?? user.verified;

  if (user.verifiedEmail !== true) {
    missingRequirements.push("verifierad e-post");
  }

  if (verifiedIdentity !== true) {
    missingRequirements.push("verifierad identitet");
  }

  if (user.accountType !== "student") {
    missingRequirements.push("studentkonto");
  } else if (user.verifiedStudent !== true) {
    missingRequirements.push("verifierad studentstatus");
  }

  if (missingRequirements.length === 0) {
    return null;
  }

  return `Du behöver ${formatMissingRequirements(
    missingRequirements
  )} för att kunna ${targetText[target]}.`;
}
