import type { User } from "@/types";

type UserNameSource =
  | Pick<User, "displayName" | "companyName" | "fullName" | "email">
  | null
  | undefined;

export function getUserDisplayName(user: UserNameSource) {
  if (!user) return "";
  return user.displayName || user.companyName || user.fullName || user.email;
}
