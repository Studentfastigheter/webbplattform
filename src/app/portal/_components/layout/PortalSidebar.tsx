"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  MoreHorizontal,
} from "@/components/icons";
import { CampusLyanBrandLink } from "@/components/layout/CampusLyanBrandLink";
import { useCurrentCompanyPermission } from "@/features/companies/hooks/useCurrentCompanyPermission";
import { useI18n } from "@/i18n/I18nProvider";
import { stripLocaleFromPathname } from "@/i18n/config";
import { localizedText } from "@/i18n/text";
import { cn, normalizeRoute } from "@/lib/utils";
import {
  getDefaultCompanyPortalPath,
  getCompanyPortalNavSectionsForRole,
  type CompanyPortalNavSection,
} from "../../_config/company-portal-access";
import { dashboardRelPath } from "../../_statics/variables";
import { useCompanyPortal } from "./CompanyPortalContext";
import { usePortalSidebar } from "./PortalSidebarContext";

type SectionKey = CompanyPortalNavSection["key"];
type OpenSubmenu = {
  section: SectionKey;
  index: number;
} | null;

function stripQuery(path: string) {
  const normalized = normalizeRoute(stripLocaleFromPathname(path.split("?")[0]));

  if (normalized === dashboardRelPath || normalized.startsWith(`${dashboardRelPath}/`)) {
    return normalized;
  }

  return normalizeRoute(`${dashboardRelPath}${normalized === "/" ? "" : normalized}`);
}

function isCurrentRoute(targetPath: string, pathname: string, search: string) {
  const [targetBase, targetQuery] = targetPath.split("?");

  if (stripQuery(targetBase) !== stripQuery(pathname)) {
    return false;
  }

  if (!targetQuery) {
    return !search;
  }

  return search === targetQuery;
}

export default function PortalSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = usePortalSidebar();
  const { locale } = useI18n();
  const permission = useCurrentCompanyPermission();
  const portal = useCompanyPortal();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const expanded = isExpanded || isHovered || isMobileOpen;
  const navSections = useMemo(
    () => getCompanyPortalNavSectionsForRole(permission.roleName, portal.systemProvider),
    [permission.roleName, portal.systemProvider]
  );
  const comingSoonLabel = localizedText(locale, "Kommer snart", "Soon");
  const comingSoonTitle = localizedText(
    locale,
    "Släpps inom kort",
    "Coming soon"
  );
  const portalHomeHref =
    getDefaultCompanyPortalPath(permission.roleName, portal.systemProvider) ??
    dashboardRelPath;

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
  }, [isActive, navSections]);

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
        "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-gray-200/80 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out lg:translate-x-0",
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
        <CampusLyanBrandLink
          className="gap-3"
          href={portalHomeHref}
          logoClassName="h-8 w-8"
          showText={expanded}
          textClassName="text-lg"
        />
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
                  {expanded ? localizedText(locale, section.titleSv, section.titleEn) : <MoreHorizontal className="h-4 w-4" />}
                </h2>

                <ul className="flex flex-col gap-1">
                  {section.items.map((item, index) => {
                    const submenuKey = `${section.key}-${index}`;
                    const Icon = item.icon;
                    const hasSubItems = Boolean(item.subItems?.length);
                    const itemDisabled = Boolean(item.comingSoon);
                    const submenuOpen =
                      openSubmenu?.section === section.key &&
                      openSubmenu.index === index;
                    const parentActive =
                      !itemDisabled &&
                      (isActive(item.path) ||
                        item.subItems?.some((subItem) => isActive(subItem.path)));

                    return (
                      <li key={item.path}>
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
                              <Icon className="h-5 w-5" />
                            </span>
                            {expanded && (
                              <span className="menu-item-text">
                                {localizedText(locale, item.nameSv, item.nameEn)}
                              </span>
                            )}
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
                          itemDisabled ? (
                            <button
                              aria-disabled="true"
                              className={cn(
                                "menu-item group cursor-not-allowed text-gray-400 opacity-80 hover:bg-transparent hover:text-gray-400",
                                expanded ? "lg:justify-start" : "lg:justify-center"
                              )}
                              title={comingSoonTitle}
                              type="button"
                            >
                              <span className="shrink-0 text-gray-400">
                                <Icon className="h-5 w-5" />
                              </span>
                              {expanded && (
                                <>
                                  <span className="menu-item-text min-w-0 flex-1 truncate text-left">
                                    {localizedText(locale, item.nameSv, item.nameEn)}
                                  </span>
                                  <span className="ml-auto shrink-0 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold leading-4 text-amber-700">
                                    {comingSoonLabel}
                                  </span>
                                </>
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
                                <Icon className="h-5 w-5" />
                              </span>
                              {expanded && (
                                <>
                                  <span className="menu-item-text min-w-0 flex-1 truncate">
                                    {localizedText(locale, item.nameSv, item.nameEn)}
                                  </span>
                                  {item.badge ? (
                                    <span className="ml-auto shrink-0 rounded-md border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold leading-4 text-sky-700">
                                      {localizedText(
                                        locale,
                                        item.badge.labelSv,
                                        item.badge.labelEn
                                      )}
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Link>
                          )
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
                                      {localizedText(locale, subItem.nameSv, subItem.nameEn)}
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
