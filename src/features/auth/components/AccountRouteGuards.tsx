"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LoadingScreen } from "@/components/ui/loader";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";
import {
  isAdminAuthAccount,
  isPortalAuthAccount,
  isSiteAuthAccount,
} from "@/features/auth/lib/account-access";

type RouteGuardProps = {
  children: ReactNode;
};

function RouteFallback({ message }: { message: string }) {
  return <LoadingScreen label={message} />;
}

export function SiteAccountGuard({ children }: RouteGuardProps) {
  const router = useRouter();
  const { locale, localizedHref } = useI18n();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (isLoading || !user) return;

    if (!isSiteAuthAccount(user)) {
      logout();
      router.replace(localizedHref("/login"));
    }
  }, [isLoading, localizedHref, logout, router, user]);

  if (user && !isSiteAuthAccount(user)) {
    return <RouteFallback message={localizedText(locale, "Skickar dig vidare...", "Redirecting you...")} />;
  }

  // Blockera INTE på isLoading: publika sajten (inkl. login/registrering)
  // ska målas direkt även när backendens sessionskoll är långsam. Guarden
  // finns bara för att slussa bort portal-/admin-konton, och det hanterar
  // effekten ovan i efterhand — `user` är null tills kollen är klar, så
  // fel kontotyp kan aldrig hinna interagera som site-användare.
  return children;
}

export function AuthenticatedSiteRouteGuard({ children }: RouteGuardProps) {
  const router = useRouter();
  const { locale } = useI18n();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || user) return;

    router.replace("/");
  }, [isLoading, router, user]);

  if (isLoading || !user) {
    return (
      <RouteFallback
        message={localizedText(locale, "Skickar dig vidare...", "Redirecting you...")}
      />
    );
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

    if (!isPortalAuthAccount(user)) {
      logout();
      router.replace("/login");
    }
  }, [isLoading, logout, router, user]);

  if (isLoading) {
    return <RouteFallback message="Laddar portal..." />;
  }

  if (!user || !isPortalAuthAccount(user)) {
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

    if (!isAdminAuthAccount(user)) {
      logout();
      router.replace("/login");
    }
  }, [isLoading, logout, router, user]);

  if (isLoading) {
    return <RouteFallback message="Laddar admin..." />;
  }

  if (!user || !isAdminAuthAccount(user)) {
    return <RouteFallback message="Kontrollerar behörighet..." />;
  }

  return children;
}
