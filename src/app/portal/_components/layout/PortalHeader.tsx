"use client";

import Link from "next/link";
import { ChevronDown, HelpCircle, LogOut, Menu, Settings, X } from "@/components/icons";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { CampusLyanBrandLink } from "@/components/layout/CampusLyanBrandLink";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useCurrentCompanyPermission } from "@/features/companies/hooks/useCurrentCompanyPermission";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";
import { getActiveCompanySummary } from "@/lib/company-access";
import {
  getDefaultCompanyPortalPath,
  isCompanyPortalPathAllowed,
} from "../../_config/company-portal-access";
import { dashboardRelPath } from "../../_statics/variables";
import { useCompanyPortal } from "./CompanyPortalContext";
import { usePortalSidebar } from "./PortalSidebarContext";

export default function PortalHeader() {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = usePortalSidebar();
  const { user, logout } = useAuth();
  const { locale } = useI18n();
  const permission = useCurrentCompanyPermission();
  const portal = useCompanyPortal();
  const activeCompany = getActiveCompanySummary(user);
  const displayName =
    portal.company?.name ||
    activeCompany?.name ||
    user?.companyName ||
    user?.displayName ||
    user?.email ||
    "Account";
  const email = user?.email || "";
  const permissionLabel = permission.isLoading
    ? localizedText(locale, "Hämtar...", "Loading...")
    : permission.label || localizedText(locale, "Okänd behörighet", "Unknown permission");
  const portalHomeHref =
    getDefaultCompanyPortalPath(permission.roleName, portal.systemProvider) ??
    dashboardRelPath;
  const canAccessAccountSettings = isCompanyPortalPathAllowed(
    `${dashboardRelPath}/settings`,
    permission.roleName,
    portal.systemProvider
  );
  const providerLabel = localizedText(
    locale,
    portal.policy.labelSv,
    portal.policy.labelEn
  );
  const avatarSrc =
    activeCompany
      ? portal.company?.logoUrl || activeCompany.logoUrl || user?.logoUrl || ""
      : user?.logoUrl || "";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
      return;
    }

    toggleMobileSidebar();
  };

  return (
    <header className="sticky top-0 z-30 flex w-full min-w-0 border-gray-200/80 bg-white/95 backdrop-blur lg:border-b">
      <div className="flex min-w-0 grow items-center justify-between gap-3 px-3 py-3 sm:gap-4 lg:px-6 lg:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label={localizedText(locale, "Växla sidomeny", "Toggle sidebar")}
            className="portal-control flex h-10 w-10 items-center justify-center text-gray-500 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 lg:h-11 lg:w-11"
            onClick={handleToggle}
            type="button"
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <CampusLyanBrandLink
            className="lg:hidden"
            href={portalHomeHref}
            logoSize={28}
            textClassName="text-sm"
          />
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3">
          <LanguageSwitcher className="h-11 w-11 rounded-lg text-gray-600 transition hover:bg-gray-50 hover:opacity-100" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="group flex items-center rounded-xl px-1.5 py-1 text-gray-700 transition hover:bg-gray-50"
                type="button"
              >
                <Avatar className="mr-3 h-11 w-11 overflow-hidden rounded-none bg-transparent">
                  {avatarSrc ? (
                    <AvatarImage
                      alt={`${displayName} logo`}
                      className="object-contain"
                      src={avatarSrc}
                    />
                  ) : null}
                  <AvatarFallback className="rounded-md bg-brand-50 text-brand-500">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="mr-1 hidden max-w-36 truncate font-medium text-theme-sm sm:block">
                  {displayName}
                </span>
                <ChevronDown className="hidden h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180 sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="mt-[17px] flex w-[260px] flex-col portal-surface p-3"
            >
              <DropdownMenuLabel className="px-0 pb-0 pt-0 font-normal">
                <span className="block font-medium text-gray-700 text-theme-sm">
                  {displayName}
                </span>
                <span className="mt-0.5 block truncate text-theme-xs text-gray-500">
                  {email}
                </span>
                <span className="mt-1 block truncate text-theme-xs text-gray-400">
                  {localizedText(locale, "Behörighet", "Permission")}: {permissionLabel}
                </span>
                {portal.systemProvider ? (
                  <span className="mt-1 block truncate text-theme-xs text-gray-400">
                    {localizedText(locale, "System", "System")}: {providerLabel}
                  </span>
                ) : null}
              </DropdownMenuLabel>
              <div className="flex flex-col gap-1 border-b border-gray-200 pb-3 pt-4">
                {canAccessAccountSettings && (
                  <DropdownMenuItem asChild className="rounded-lg p-0">
                    <Link
                      className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 text-theme-sm hover:bg-gray-100 hover:text-gray-700"
                      href={`${dashboardRelPath}/settings`}
                    >
                      <Settings className="h-6 w-6 text-gray-500" />
                      {localizedText(locale, "Kontoinställningar", "Account settings")}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className="rounded-lg p-0">
                  <Link
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 text-theme-sm hover:bg-gray-100 hover:text-gray-700"
                    href="/faq"
                  >
                    <HelpCircle className="h-6 w-6 text-gray-500" />
                    {localizedText(locale, "Support", "Support")}
                  </Link>
                </DropdownMenuItem>
              </div>
              <DropdownMenuItem
                className="mt-3 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 text-theme-sm hover:bg-gray-100 hover:text-gray-700"
                onSelect={() => logout()}
              >
                <LogOut className="h-6 w-6 text-gray-500" />
                {localizedText(locale, "Logga ut", "Log out")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
