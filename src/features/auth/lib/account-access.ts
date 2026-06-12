import { getActiveCompanyId } from "@/lib/company-access";
import type { User } from "@/types";

export function isSiteAuthAccount(user: User) {
  return user.accountType === "student" || user.accountType === "quick_register";
}

export function isVerifiedStudentAuthAccount(user: User | null | undefined) {
  return user?.accountType === "student";
}

export function isPortalAuthAccount(user: User) {
  return user.accountType === "company" && getActiveCompanyId(user) != null;
}

export function isAdminAuthAccount(user: User) {
  return user.accountType === "admin";
}
