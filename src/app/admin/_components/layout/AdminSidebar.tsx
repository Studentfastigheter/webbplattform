"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ActivityIcon,
  BarChart3Icon,
  Building2Icon,
  ListChecksIcon,
  MailIcon,
  MapPinIcon,
  MoreHorizontalIcon,
  SchoolIcon,
  TagsIcon,
  UsersIcon,
} from "lucide-react";

import { cn, normalizeRoute } from "@/lib/utils";
import { useAdminSidebar } from "./AdminSidebarContext";

type AdminNavItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
};

const operationsItems: AdminNavItem[] = [
  {
    name: "Tags",
    path: "/tags",
    icon: <TagsIcon className="h-5 w-5" />,
  },
  {
    name: "Schools",
    path: "/schools",
    icon: <SchoolIcon className="h-5 w-5" />,
  },
  {
    name: "Locations",
    path: "/locations",
    icon: <MapPinIcon className="h-5 w-5" />,
  },
];

const accountItems: AdminNavItem[] = [
  {
    name: "Companies",
    path: "/companies",
    icon: <Building2Icon className="h-5 w-5" />,
  },
  {
    name: "Accounts",
    path: "/accounts",
    icon: <UsersIcon className="h-5 w-5" />,
  },
  {
    name: "Activities",
    path: "/activities",
    icon: <ActivityIcon className="h-5 w-5" />,
  },
  {
    name: "Waitlist",
    path: "/waitlist",
    icon: <MailIcon className="h-5 w-5" />,
  },
  {
    name: "Statistics",
    path: "/statistics",
    icon: <BarChart3Icon className="h-5 w-5" />,
  },
  {
    name: "Legacy",
    path: "/legacy",
    icon: <ListChecksIcon className="h-5 w-5" />,
  },
];

const navSections = [
  { key: "operations", title: "Platform", items: operationsItems },
  { key: "management", title: "Admin", items: accountItems },
] as const;

function pathMatches(targetPath: string, pathname: string) {
  const currentBase = normalizeRoute(pathname.replace(/^\/admin/, "") || "/");

  return normalizeRoute(targetPath) === currentBase;
}

export default function AdminSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useAdminSidebar();
  const pathname = usePathname();
  const expanded = isExpanded || isHovered || isMobileOpen;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out lg:translate-x-0",
        isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "flex py-8",
          expanded ? "justify-start" : "lg:justify-center"
        )}
      >
        <Link className="flex items-center gap-3" href="/">
          <Image
            alt="CampusLyan"
            className="h-8 w-8 shrink-0"
            height={32}
            src="/campuslyan-logo.svg"
            width={32}
          />
          {expanded && (
            <span className="text-lg font-semibold tracking-tight text-gray-900">
              Admin
            </span>
          )}
        </Link>
      </div>

      <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <div className="flex flex-col gap-7">
            {navSections.map((section) => (
              <div key={section.key}>
                <h2
                  className={cn(
                    "mb-3 flex px-3 text-xs font-semibold uppercase leading-5 tracking-wide text-gray-400",
                    expanded ? "justify-start" : "lg:justify-center"
                  )}
                >
                  {expanded ? section.title : <MoreHorizontalIcon className="h-4 w-4" />}
                </h2>

                <ul className="flex flex-col gap-1">
                  {section.items.map((item) => {
                    const active = pathMatches(item.path, pathname);

                    return (
                      <li key={item.name}>
                        <Link
                          className={cn(
                            "menu-item group",
                            active ? "menu-item-active" : "menu-item-inactive",
                            expanded ? "lg:justify-start" : "lg:justify-center"
                          )}
                          href={item.path}
                        >
                          <span
                            className={cn(
                              active
                                ? "menu-item-icon-active"
                                : "menu-item-icon-inactive"
                            )}
                          >
                            {item.icon}
                          </span>
                          {expanded && <span className="menu-item-text">{item.name}</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
}
