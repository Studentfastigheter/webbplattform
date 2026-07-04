"use client";

import { Loader2Icon, ShieldCheckIcon } from "@/components/icons";

import { useCurrentCompanyPermission } from "@/features/companies/hooks/useCurrentCompanyPermission";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

export default function AccountPermission() {
  const { locale } = useI18n();
  const permission = useCurrentCompanyPermission();
  const permissionLabel = permission.isLoading
    ? localizedText(locale, "Hämtar behörighet...", "Loading permission...")
    : permission.label || localizedText(locale, "Okänd behörighet", "Unknown permission");

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
      <div className="flex flex-col space-y-1">
        <h3 className="font-semibold">
          {localizedText(locale, "Behörighet", "Permission")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {localizedText(locale, "Din roll för det aktiva företagskontot.", "Your role for the active company account.")}
        </p>
      </div>

      <div className="lg:col-span-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-brand/10 text-brand">
              {permission.isLoading ? (
                <Loader2Icon className="size-5 animate-spin" />
              ) : (
                <ShieldCheckIcon className="size-5" />
              )}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-950">
                {localizedText(locale, "Kontobehörighet", "Account permission")}
              </p>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {permissionLabel}
              </p>
            </div>
          </div>

          {permission.accessLevel != null ? (
            <span className="inline-flex h-7 w-fit items-center rounded-full bg-gray-100 px-2.5 text-xs font-medium text-gray-600">
              Access {permission.accessLevel}
            </span>
          ) : null}
        </div>

        {permission.description ? (
          <p className="mt-3 text-sm text-muted-foreground">
            {permission.description}
          </p>
        ) : null}

        {permission.isError && !permission.hasPermission ? (
          <p className="mt-3 text-sm text-amber-700">
            {localizedText(locale, "Behörigheten kunde inte hämtas just nu.", "The permission could not be loaded right now.")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
