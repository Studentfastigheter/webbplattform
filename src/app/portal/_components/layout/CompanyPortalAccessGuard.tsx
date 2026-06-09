"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/ui/loader";
import { useCurrentCompanyPermission } from "@/features/companies/hooks/useCurrentCompanyPermission";
import { useI18n } from "@/i18n/I18nProvider";
import { stripLocaleFromPathname } from "@/i18n/config";
import { localizedText } from "@/i18n/text";
import { normalizeRoute } from "@/lib/utils";
import {
  getDefaultCompanyPortalPath,
  isCompanyPortalPathAllowed,
} from "../../_config/company-portal-access";

export function CompanyPortalAccessGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useI18n();
  const permission = useCurrentCompanyPermission();
  const routingPathname = normalizeRoute(stripLocaleFromPathname(pathname));
  const roleName = permission.roleName || null;
  const isAllowed = isCompanyPortalPathAllowed(routingPathname, roleName);
  const fallbackPath = getDefaultCompanyPortalPath(roleName);
  const isRedirecting =
    Boolean(fallbackPath) && normalizeRoute(fallbackPath ?? "") !== routingPathname;

  useEffect(() => {
    if (permission.isLoading && !roleName) return;
    if (isAllowed || !fallbackPath) return;

    router.replace(fallbackPath);
  }, [fallbackPath, isAllowed, permission.isLoading, roleName, router]);

  if (permission.isLoading && !roleName) {
    return (
      <LoadingScreen
        label={localizedText(locale, "Kontrollerar behörighet...", "Checking access...")}
      />
    );
  }

  if (isAllowed) {
    return children;
  }

  if (isRedirecting) {
    return (
      <LoadingScreen
        label={localizedText(locale, "Skickar dig vidare...", "Redirecting you...")}
      />
    );
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-gray-50 px-6">
      <section className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900">
          {localizedText(locale, "Saknar behörighet", "Access denied")}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {localizedText(
            locale,
            "Din företagsroll har inte åtkomst till den här portalsidan.",
            "Your company role does not have access to this portal page."
          )}
        </p>
      </section>
    </main>
  );
}
