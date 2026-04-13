"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

type RouteGuardProps = {
  children: ReactNode;
};

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

    if (user.accountType === "company") {
      router.replace("/portal");
      return;
    }

    if (user.accountType !== "student") {
      logout();
      router.replace("/logga-in");
    }
  }, [isLoading, logout, router, user]);

  if (isLoading) {
    return <RouteFallback message="Laddar..." />;
  }

  if (user && user.accountType !== "student") {
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

    if (user.accountType === "student") {
      router.replace("/");
      return;
    }

    if (user.accountType !== "company") {
      logout();
      router.replace("/logga-in");
    }
  }, [isLoading, logout, router, user]);

  if (isLoading) {
    return <RouteFallback message="Laddar portal..." />;
  }

  if (!user || user.accountType !== "company") {
    return <RouteFallback message="Kontrollerar behörighet..." />;
  }

  return children;
}
