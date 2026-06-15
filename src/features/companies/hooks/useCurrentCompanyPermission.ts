"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n/I18nProvider";
import { getActiveCompanyId, getActiveCompanySummary } from "@/lib/company-access";
import {
  getCompanyRoleAccessLevel,
  getCompanyRoleDescription,
  getCompanyRoleDisplayName,
  getCompanyRoleName,
  type CompanyRoleLike,
} from "@/lib/company-permissions";
import type { User } from "@/types/user";
import { useCompanyUsers } from "./useCompanies";

function getUserRoleSource(user: User | null | undefined): CompanyRoleLike {
  if (!user) return null;

  const source = user as User & Record<string, unknown>;
  const role = source.role ?? source.companyRole ?? source.permission;

  if (typeof role === "string" || (typeof role === "object" && role !== null)) {
    return role as CompanyRoleLike;
  }

  if (typeof source.roleName === "string" && source.roleName.trim()) {
    return source.roleName;
  }

  if (typeof source.permissionName === "string" && source.permissionName.trim()) {
    return source.permissionName;
  }

  return null;
}

function firstRoleWithName(...roles: CompanyRoleLike[]) {
  return roles.find((role) => Boolean(getCompanyRoleName(role))) ?? null;
}

export function useCurrentCompanyPermission() {
  const { locale } = useI18n();
  const { user } = useAuth();
  const companyId = getActiveCompanyId(user);
  const activeCompany = getActiveCompanySummary(user);
  const rootRole = getUserRoleSource(user);
  const {
    data: companyUsers = [],
    isLoading,
    isError,
  } = useCompanyUsers(companyId);

  const currentCompanyUser = useMemo(() => {
    const currentEmail = user?.email?.trim().toLowerCase();
    const currentUserId =
      typeof user?.id === "number" && Number.isFinite(user.id) ? user.id : null;

    return (
      companyUsers.find((entry) => {
        if (entry.companyId !== companyId) {
          return false;
        }

        if (currentUserId != null && entry.id === currentUserId) {
          return true;
        }

        return Boolean(
          currentEmail && entry.email?.trim().toLowerCase() === currentEmail
        );
      }) ?? null
    );
  }, [companyId, companyUsers, user?.email, user?.id]);

  const role = firstRoleWithName(
    currentCompanyUser?.role ?? null,
    activeCompany?.role ?? null,
    activeCompany?.roleName ?? null,
    rootRole
  );
  const roleName = getCompanyRoleName(role);
  const description =
    getCompanyRoleDescription(currentCompanyUser?.role) ??
    getCompanyRoleDescription(activeCompany?.role) ??
    activeCompany?.roleDescription ??
    getCompanyRoleDescription(rootRole);
  const accessLevel =
    getCompanyRoleAccessLevel(currentCompanyUser?.role) ??
    getCompanyRoleAccessLevel(activeCompany?.role) ??
    activeCompany?.accessLevel ??
    getCompanyRoleAccessLevel(rootRole);

  return {
    currentCompanyUser,
    roleName,
    label: roleName ? getCompanyRoleDisplayName(roleName, locale) : "",
    description,
    accessLevel,
    isLoading: Boolean(companyId) && isLoading && !roleName,
    isError,
    hasPermission: Boolean(roleName),
  };
}
