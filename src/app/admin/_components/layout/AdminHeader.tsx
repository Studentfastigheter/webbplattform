"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, LogOut, Menu, ShieldCheckIcon, X } from "lucide-react";

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
    <header className="sticky top-0 z-30 flex w-full min-w-0 border-gray-200 bg-white lg:border-b">
      <div className="flex min-w-0 grow items-center justify-between gap-3 px-3 py-3 sm:gap-4 lg:px-6 lg:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label="Toggle sidebar"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 lg:h-11 lg:w-11"
            onClick={handleToggle}
            type="button"
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link className="flex items-center gap-2 lg:hidden" href="/">
            <Image alt="CampusLyan" height={28} src="/campuslyan-logo.svg" width={28} />
            <span className="text-sm font-semibold text-gray-900">Admin</span>
          </Link>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 sm:inline-flex">
            <ShieldCheckIcon className="h-4 w-4" />
            Admin portal
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="group flex items-center text-gray-700" type="button">
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
                  Administrator account
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
