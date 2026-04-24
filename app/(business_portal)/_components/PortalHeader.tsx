"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, ChevronDown, HelpCircle, LogOut, Menu, Settings, UserCircle, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId, getActiveCompanySummary } from "@/lib/company-access";
import { queueService } from "@/services/queue-service";
import { dashboardRelPath } from "../_statics/variables";
import { usePortalSidebar } from "./PortalSidebarContext";

export default function PortalHeader() {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = usePortalSidebar();
  const { user, logout } = useAuth();
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);
  const activeCompany = getActiveCompanySummary(user);
  const displayName = activeCompany?.name || user?.companyName || user?.displayName || "SGS";
  const email = user?.email || "test@sgs.se";
  const role = activeCompany ? "Företagskonto" : "Hyresvärd";
  const avatarSrc =
    activeCompany
      ? companyLogoUrl || activeCompany.logoUrl || user?.logoUrl || ""
      : user?.logoUrl || "";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    setCompanyLogoUrl(null);

    const companyId = getActiveCompanyId(user);
    if (companyId == null) {
      return;
    }

    let active = true;

    queueService
      .getCompany(companyId)
      .then((company) => {
        if (!active) return;
        setCompanyLogoUrl(company.logoUrl || null);
      })
      .catch(() => {
        if (!active) return;
        setCompanyLogoUrl(null);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
      return;
    }

    toggleMobileSidebar();
  };

  return (
    <header className="sticky top-0 z-30 flex w-full border-gray-200 bg-white lg:border-b">
      <div className="flex grow items-center justify-between gap-3 px-3 py-3 sm:gap-4 lg:px-6 lg:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label="Växla sidomeny"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 lg:h-11 lg:w-11"
            onClick={handleToggle}
            type="button"
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link className="flex items-center gap-2 lg:hidden" href={dashboardRelPath}>
            <Image alt="CampusLyan" height={28} src="/campuslyan-logo.svg" width={28} />
            <span className="text-sm font-semibold text-gray-900">CampusLyan</span>
          </Link>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3">
          <button
            aria-label="Notiser"
            className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50"
            type="button"
          >
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error-500" />
            <Bell className="h-5 w-5" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="group flex items-center text-gray-700"
                type="button"
              >
                <Avatar className="mr-3 h-11 w-11 overflow-hidden rounded-none bg-transparent">
                  {avatarSrc ? (
                    <AvatarImage
                      alt={`${displayName} logotyp`}
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
              className="mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg"
            >
              <DropdownMenuLabel className="px-0 pb-0 pt-0 font-normal">
                <span className="block font-medium text-gray-700 text-theme-sm">
                  {displayName}
                </span>
                <span className="mt-0.5 block truncate text-theme-xs text-gray-500">
                  {email}
                </span>
                <span className="mt-1 block text-theme-xs text-gray-400">
                  {role}
                </span>
              </DropdownMenuLabel>
              <div className="flex flex-col gap-1 border-b border-gray-200 pb-3 pt-4">
                <DropdownMenuItem asChild className="rounded-lg p-0">
                  <Link
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 text-theme-sm hover:bg-gray-100 hover:text-gray-700"
                    href={`${dashboardRelPath}/profil`}
                  >
                    <UserCircle className="h-6 w-6 text-gray-500" />
                    Redigera profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg p-0">
                  <Link
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 text-theme-sm hover:bg-gray-100 hover:text-gray-700"
                    href={`${dashboardRelPath}/installningar`}
                  >
                    <Settings className="h-6 w-6 text-gray-500" />
                    Kontoinställningar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg p-0">
                  <Link
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 text-theme-sm hover:bg-gray-100 hover:text-gray-700"
                    href="/faq"
                  >
                    <HelpCircle className="h-6 w-6 text-gray-500" />
                    Support
                  </Link>
                </DropdownMenuItem>
              </div>
              <DropdownMenuItem
                className="mt-3 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 text-theme-sm hover:bg-gray-100 hover:text-gray-700"
                onSelect={() => logout()}
              >
                <LogOut className="h-6 w-6 text-gray-500" />
                Logga ut
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
