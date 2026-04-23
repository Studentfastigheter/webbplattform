"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  FileText,
  Home,
  MoreHorizontal,
  Newspaper,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";
import CampusLyanLogo from "@/public/campuslyan-logo.svg";
import { cn, normalizeRoute } from "@/lib/utils";
import { dashboardRelPath } from "../_statics/variables";
import { usePortalSidebar } from "./PortalSidebarContext";

type PortalNavItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
  subItems?: {
    name: string;
    path: string;
  }[];
};

const portalItems: PortalNavItem[] = [
  {
    name: "\u00D6versikt",
    path: dashboardRelPath,
    icon: <Home className="h-5 w-5" />,
  },
  {
    name: "Annonser",
    path: `${dashboardRelPath}/annonser`,
    icon: <FileText className="h-5 w-5" />,
    subItems: [
      { name: "Mina annonser", path: `${dashboardRelPath}/annonser` },
      {
        name: "Skapa annons",
        path: `${dashboardRelPath}/annonser/ny/onboarding/1`,
      },
    ],
  },
  {
    name: "Ans\u00F6kningar",
    path: `${dashboardRelPath}/ansokningar`,
    icon: <Users className="h-5 w-5" />,
    subItems: [
      {
        name: "Intresseanm\u00E4lningar",
        path: `${dashboardRelPath}/ansokningar`,
      },
      {
        name: "K\u00F6 ans\u00F6kningar",
        path: `${dashboardRelPath}/ansokningar?filter=ko`,
      },
    ],
  },
];

const insightItems: PortalNavItem[] = [
  {
    name: "Analys",
    path: `${dashboardRelPath}/analytics`,
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    name: "Produktnyheter",
    path: `${dashboardRelPath}/produktnyheter`,
    icon: <Newspaper className="h-5 w-5" />,
  },
  {
    name: "Guider",
    path: `${dashboardRelPath}/guider`,
    icon: <BookOpen className="h-5 w-5" />,
  },
];

const settingsItems: PortalNavItem[] = [
  {
    name: "Mina inst\u00E4llningar",
    path: `${dashboardRelPath}/installningar`,
    icon: <Settings className="h-5 w-5" />,
  },
  {
    name: "Användare",
    path: `${dashboardRelPath}/anvandare`,
    icon: <Users className="h-5 w-5" />,
  },
  {
    name: "F\u00F6retagsprofil",
    path: `${dashboardRelPath}/profil`,
    icon: <UserCircle className="h-5 w-5" />,
  },
];

const navSections = [
  { key: "portal", title: "Portal", items: portalItems },
  { key: "insights", title: "Insikter", items: insightItems },
  { key: "settings", title: "Inst\u00E4llningar", items: settingsItems },
] as const;

type SectionKey = (typeof navSections)[number]["key"];
type OpenSubmenu = {
  section: SectionKey;
  index: number;
} | null;

function stripQuery(path: string) {
  return normalizeRoute(path.split("?")[0]);
}

function isCurrentRoute(targetPath: string, pathname: string, search: string) {
  const [targetBase, targetQuery] = targetPath.split("?");

  if (stripQuery(targetBase) !== normalizeRoute(pathname)) {
    return false;
  }

  if (!targetQuery) {
    return !search;
  }

  return search === targetQuery;
}

export default function PortalSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = usePortalSidebar();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const expanded = isExpanded || isHovered || isMobileOpen;

  const [openSubmenu, setOpenSubmenu] = useState<OpenSubmenu>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => isCurrentRoute(path, pathname, search),
    [pathname, search]
  );

  useEffect(() => {
    let matchedSubmenu = false;

    navSections.forEach((section) => {
      section.items.forEach((item, index) => {
        if (item.subItems?.some((subItem) => isActive(subItem.path))) {
          setOpenSubmenu({ section: section.key, index });
          matchedSubmenu = true;
        }
      });
    });

    if (!matchedSubmenu) {
      setOpenSubmenu(null);
    }
  }, [isActive]);

  useEffect(() => {
    if (!expanded || !openSubmenu) {
      return;
    }

    const key = `${openSubmenu.section}-${openSubmenu.index}`;
    const submenuElement = subMenuRefs.current[key];

    if (!submenuElement) {
      return;
    }

    setSubMenuHeight((previousHeights) => ({
      ...previousHeights,
      [key]: submenuElement.scrollHeight,
    }));
  }, [expanded, openSubmenu]);

  const handleSubmenuToggle = (section: SectionKey, index: number) => {
    setOpenSubmenu((previousSubmenu) => {
      if (
        previousSubmenu &&
        previousSubmenu.section === section &&
        previousSubmenu.index === index
      ) {
        return null;
      }

      return { section, index };
    });
  };

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
        <Link className="flex items-center gap-3" href={dashboardRelPath}>
          <Image
            alt="CampusLyan"
            className="h-8 w-8 shrink-0"
            height={32}
            src={CampusLyanLogo}
            width={32}
          />
          {expanded && (
            <span className="text-lg font-semibold tracking-tight text-gray-900">
              CampusLyan
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
                  {expanded ? section.title : <MoreHorizontal className="h-4 w-4" />}
                </h2>

                <ul className="flex flex-col gap-1">
                  {section.items.map((item, index) => {
                    const submenuKey = `${section.key}-${index}`;
                    const hasSubItems = Boolean(item.subItems?.length);
                    const submenuOpen =
                      openSubmenu?.section === section.key &&
                      openSubmenu.index === index;
                    const parentActive =
                      isActive(item.path) ||
                      item.subItems?.some((subItem) => isActive(subItem.path));

                    return (
                      <li key={item.name}>
                        {hasSubItems ? (
                          <button
                            className={cn(
                              "menu-item group cursor-pointer",
                              submenuOpen ? "menu-item-active" : "menu-item-inactive",
                              expanded ? "lg:justify-start" : "lg:justify-center"
                            )}
                            onClick={() => handleSubmenuToggle(section.key, index)}
                            type="button"
                          >
                            <span
                              className={cn(
                                submenuOpen ? "menu-item-icon-active" : "menu-item-icon-inactive"
                              )}
                            >
                              {item.icon}
                            </span>
                            {expanded && <span className="menu-item-text">{item.name}</span>}
                            {expanded && (
                              <ChevronDown
                                className={cn(
                                  "ml-auto h-5 w-5 transition-transform duration-200",
                                  submenuOpen ? "rotate-180 text-brand-500" : "text-gray-500"
                                )}
                              />
                            )}
                          </button>
                        ) : (
                          <Link
                            className={cn(
                              "menu-item group",
                              parentActive ? "menu-item-active" : "menu-item-inactive",
                              expanded ? "lg:justify-start" : "lg:justify-center"
                            )}
                            href={item.path}
                          >
                            <span
                              className={cn(
                                parentActive
                                  ? "menu-item-icon-active"
                                  : "menu-item-icon-inactive"
                              )}
                            >
                              {item.icon}
                            </span>
                            {expanded && <span className="menu-item-text">{item.name}</span>}
                          </Link>
                        )}

                        {hasSubItems && expanded && (
                          <div
                            ref={(element) => {
                              subMenuRefs.current[submenuKey] = element;
                            }}
                            className="overflow-hidden transition-all duration-300"
                            style={{
                              height: submenuOpen ? `${subMenuHeight[submenuKey] ?? 0}px` : "0px",
                            }}
                          >
                            <ul className="ml-9 mt-2 space-y-1">
                              {item.subItems?.map((subItem) => {
                                const childActive = isActive(subItem.path);

                                return (
                                  <li key={subItem.path}>
                                    <Link
                                      className={cn(
                                        "menu-dropdown-item",
                                        childActive
                                          ? "menu-dropdown-item-active"
                                          : "menu-dropdown-item-inactive"
                                      )}
                                      href={subItem.path}
                                    >
                                      {subItem.name}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
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
