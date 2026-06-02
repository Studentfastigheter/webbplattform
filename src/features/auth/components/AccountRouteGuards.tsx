"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LoadingScreen } from "@/components/ui/loader";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import { buildPortalUrl } from "@/lib/subdomain-routing";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

type RouteGuardProps = {
  children: ReactNode;
};

const SITE_ACCOUNT_TYPES = new Set(["student"]);

function isSuperadminAccount(accountType: string | undefined) {
  return accountType === "superadmin" || accountType === "admin";
}

function RouteFallback({ message }: { message: string }) {
  return <LoadingScreen label={message} />;
}

export function SiteAccountGuard({ children }: RouteGuardProps) {
  const router = useRouter();
  const { locale, localizedHref } = useI18n();
  const { user, token, isLoading, logout } = useAuth();

  useEffect(() => {
    if (isLoading || !user) return;

    if (getActiveCompanyId(user) != null) {
      window.location.replace(buildPortalUrl("/", token));
      return;
    }

    if (!SITE_ACCOUNT_TYPES.has(user.accountType)) {
      logout();
      router.replace(localizedHref("/login"));
    }
  }, [isLoading, localizedHref, logout, router, token, user]);

  if (isLoading) {
    return <RouteFallback message={localizedText(locale, "Laddar...", "Loading...")} />;
  }

  if (
    user &&
    (!SITE_ACCOUNT_TYPES.has(user.accountType) || getActiveCompanyId(user) != null)
  ) {
    return <RouteFallback message={localizedText(locale, "Skickar dig vidare...", "Redirecting you...")} />;
  }

  return children;
}

export function PortalAccountGuard({ children }: RouteGuardProps) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    const companyId = getActiveCompanyId(user);

    if (
      (user.accountType === "student" || user.accountType === "quick_register") &&
      companyId == null
    ) {
      logout();
      router.replace("/login");
      return;
    }

    if (companyId == null) {
      logout();
      router.replace("/login");
    }
  }, [isLoading, logout, router, user]);

  if (isLoading) {
    return <RouteFallback message="Laddar portal..." />;
  }

  if (!user || getActiveCompanyId(user) == null) {
    return <RouteFallback message="Kontrollerar behörighet..." />;
  }

  return children;
}

export function AdminAccountGuard({ children }: RouteGuardProps) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!isSuperadminAccount(user.accountType)) {
      logout();
      router.replace("/login");
    }
  }, [isLoading, logout, router, user]);

  if (isLoading) {
    return <RouteFallback message="Laddar superadmin..." />;
  }

  if (!user || !isSuperadminAccount(user.accountType)) {
    return <RouteFallback message="Kontrollerar behörighet..." />;
  }

  return children;
}
