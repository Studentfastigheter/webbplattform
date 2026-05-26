import type { User } from "@/types";

type UserNameSource =
  | Pick<
      User,
      "displayName" | "companyName" | "fullName" | "firstName" | "surname" | "email"
    >
  | null
  | undefined;

export function getUserDisplayName(user: UserNameSource) {
  if (!user) return "";

  const studentName = [user.firstName, user.surname]
    .map((namePart) => namePart?.trim())
    .filter(Boolean)
    .join(" ");

  return (
    studentName ||
    user.displayName ||
    user.companyName ||
    user.fullName ||
    user.email
  );
}
