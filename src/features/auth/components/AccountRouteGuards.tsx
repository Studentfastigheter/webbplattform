"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import { buildPortalUrl } from "@/lib/subdomain-routing";

type RouteGuardProps = {
  children: ReactNode;
};

const SITE_ACCOUNT_TYPES = new Set(["student"]);

function RouteFallback({ message }: { message: string }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-white px-6 text-sm text-neutral-500">
      {message}
    </div>
  );
}

export function SiteAccountGuard({ children }: RouteGuardProps) {
  const router = useRouter();
  const { user, token, isLoading, logout } = useAuth();

  useEffect(() => {
    if (isLoading || !user) return;

    if (getActiveCompanyId(user) != null) {
      window.location.replace(buildPortalUrl("/", token));
      return;
    }

    if (!SITE_ACCOUNT_TYPES.has(user.accountType)) {
      logout();
      router.replace("/login");
    }
  }, [isLoading, logout, router, token, user]);

  if (isLoading) {
    return <RouteFallback message="Laddar..." />;
  }

  if (
    user &&
    (!SITE_ACCOUNT_TYPES.has(user.accountType) || getActiveCompanyId(user) != null)
  ) {
    return <RouteFallback message="Skickar dig vidare..." />;
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

    if (user.accountType !== "admin") {
      logout();
      router.replace("/login");
    }
  }, [isLoading, logout, router, user]);

  if (isLoading) {
    return <RouteFallback message="Laddar admin..." />;
  }

  if (!user || user.accountType !== "admin") {
    return <RouteFallback message="Kontrollerar behörighet..." />;
  }

  return children;
}
