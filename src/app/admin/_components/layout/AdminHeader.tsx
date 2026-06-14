"use client";

import { ChevronDown, LogOut, Menu, ShieldCheckIcon, X } from "@/components/icons";

import { CampusLyanBrandLink } from "@/components/layout/CampusLyanBrandLink";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useAdminSidebar } from "./AdminSidebarContext";

export default function AdminHeader() {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useAdminSidebar();
  const { user, logout } = useAuth();
  const displayName = user?.displayName || user?.email || "Admin";
  const email = user?.email || "";
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
            aria-label="Toggle sidebar"
            className="portal-control flex h-10 w-10 items-center justify-center text-gray-500 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 lg:h-11 lg:w-11"
            onClick={handleToggle}
            type="button"
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <CampusLyanBrandLink
            className="lg:hidden"
            href="/"
            logoSize={28}
            textClassName="text-sm"
          />
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3">
          <span className="portal-control hidden h-9 items-center gap-2 px-3 text-xs font-medium text-brand-700 sm:inline-flex">
            <ShieldCheckIcon className="h-4 w-4 text-brand-500" />
            Admin portal
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="group flex items-center rounded-xl px-1.5 py-1 text-gray-700 transition hover:bg-gray-50"
                type="button"
              >
                <Avatar className="mr-3 h-11 w-11 overflow-hidden rounded-none bg-transparent">
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
                <span className="mt-1 block text-theme-xs text-gray-400">
                  Admin account
                </span>
              </DropdownMenuLabel>
              <DropdownMenuItem
                className="mt-3 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 text-theme-sm hover:bg-gray-100 hover:text-gray-700"
                onSelect={() => logout()}
              >
                <LogOut className="h-6 w-6 text-gray-500" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
