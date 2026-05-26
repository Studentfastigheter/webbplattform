"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";

type RouteGuardProps = {
  children: ReactNode;
};

const SITE_ACCOUNT_TYPES = new Set(["student", "private_landlord", "quick_register"]);

function RouteFallback({ message }: { message: string }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-white px-6 text-sm text-neutral-500">
      {message}
    </div>
  );
}

export function SiteAccountGuard({ children }: RouteGuardProps) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (isLoading || !user) return;

    if (getActiveCompanyId(user) != null) {
      router.replace("/portal");
      return;
    }

    if (!SITE_ACCOUNT_TYPES.has(user.accountType)) {
      logout();
      router.replace("/logga-in");
    }
  }, [isLoading, logout, router, user]);

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
      router.replace("/logga-in");
      return;
    }

    const companyId = getActiveCompanyId(user);

    if (
      (user.accountType === "student" || user.accountType === "quick_register") &&
      companyId == null
    ) {
      router.replace("/");
      return;
    }

    if (companyId == null) {
      logout();
      router.replace("/logga-in");
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
