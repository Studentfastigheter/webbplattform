import type { LucideIcon } from "@/components/icons";
import {
  BarChart3,
  BookOpen,
  Building2,
  FileCheck2,
  FileText,
  Home,
  Newspaper,
  Settings,
  UserCircle,
  Users,
} from "@/components/icons";
import { normalizeRoute } from "@/lib/utils";
import { dashboardRelPath } from "../_statics/variables";

export const companyPortalRoles = ["Agent", "Manager", "Admin"] as const;

export type CompanyPortalRole = (typeof companyPortalRoles)[number];

const roleAliases: Record<string, CompanyPortalRole> = {
  AGENT: "Agent",
  EDITOR: "Agent",
  ANALYST: "Agent",
  SUPPORT: "Agent",
  MANAGER: "Manager",
  ADMIN: "Admin",
};

export const companyPortalRoleGroups = {
  all: companyPortalRoles,
  managerAndAdmin: ["Manager", "Admin"],
  adminOnly: ["Admin"],
} as const satisfies Record<string, readonly CompanyPortalRole[]>;

type RoleList = readonly CompanyPortalRole[];

export type CompanyPortalNavItem = {
  id: string;
  nameSv: string;
  nameEn: string;
  path: string;
  icon: LucideIcon;
  roles: RoleList;
  subItems?: readonly {
    id: string;
    nameSv: string;
    nameEn: string;
    path: string;
    roles: RoleList;
  }[];
};

export type CompanyPortalNavSection = {
  key: string;
  titleSv: string;
  titleEn: string;
  items: readonly CompanyPortalNavItem[];
};

export type CompanyPortalPageRule = {
  id: string;
  path: string;
  match: "exact" | "prefix";
  roles: RoleList;
};

// Ändra rollerna här för att styra vilka flikar som visas i företagsportalen.
export const companyPortalNavSections: readonly CompanyPortalNavSection[] = [
  {
    key: "portal",
    titleSv: "Portal",
    titleEn: "Portal",
    items: [
      {
        id: "overview",
        nameSv: "Översikt",
        nameEn: "Overview",
        path: dashboardRelPath,
        icon: Home,
        roles: companyPortalRoleGroups.all,
      },
      {
        id: "listings",
        nameSv: "Annonser",
        nameEn: "Listings",
        path: `${dashboardRelPath}/listings`,
        icon: FileText,
        roles: companyPortalRoleGroups.all,
      },
      {
        id: "applications",
        nameSv: "Ansökningar",
        nameEn: "Applications",
        path: `${dashboardRelPath}/applications`,
        icon: Users,
        roles: companyPortalRoleGroups.all,
      },
      {
        id: "housingQueue",
        nameSv: "Bostadskö",
        nameEn: "Housing queue",
        path: `${dashboardRelPath}/housing-queue`,
        icon: Building2,
        roles: companyPortalRoleGroups.all,
      },
    ],
  },
  {
    key: "insights",
    titleSv: "Insikter",
    titleEn: "Insights",
    items: [
      {
        id: "analytics",
        nameSv: "Analys",
        nameEn: "Analytics",
        path: `${dashboardRelPath}/analytics`,
        icon: BarChart3,
        roles: companyPortalRoleGroups.managerAndAdmin,
      },
      {
        id: "productNews",
        nameSv: "Produktnyheter",
        nameEn: "Product news",
        path: `${dashboardRelPath}/product-news`,
        icon: Newspaper,
        roles: companyPortalRoleGroups.all,
      },
      {
        id: "guides",
        nameSv: "Guider",
        nameEn: "Guides",
        path: `${dashboardRelPath}/guides`,
        icon: BookOpen,
        roles: companyPortalRoleGroups.all,
      },
    ],
  },
  {
    key: "settings",
    titleSv: "Inställningar",
    titleEn: "Settings",
    items: [
      {
        id: "settings",
        nameSv: "Mina inställningar",
        nameEn: "My settings",
        path: `${dashboardRelPath}/settings`,
        icon: Settings,
        roles: companyPortalRoleGroups.all,
      },
      {
        id: "requirementProfiles",
        nameSv: "Kravprofiler",
        nameEn: "Requirement profiles",
        path: `${dashboardRelPath}/requirement-profiles`,
        icon: FileCheck2,
        roles: companyPortalRoleGroups.all,
      },
      {
        id: "users",
        nameSv: "Användare",
        nameEn: "Users",
        path: `${dashboardRelPath}/users`,
        icon: Users,
        roles: companyPortalRoleGroups.managerAndAdmin,
      },
      {
        id: "companyProfile",
        nameSv: "Företagsprofil",
        nameEn: "Company profile",
        path: `${dashboardRelPath}/profile`,
        icon: UserCircle,
        roles: companyPortalRoleGroups.managerAndAdmin,
      },
    ],
  },
] as const;

// Ändra rollerna här för att styra direkt åtkomst till portalens sidor/URL:er.
export const companyPortalPageRules = [
  {
    id: "overview",
    path: dashboardRelPath,
    match: "exact",
    roles: companyPortalRoleGroups.all,
  },
  {
    id: "listings",
    path: `${dashboardRelPath}/listings`,
    match: "exact",
    roles: companyPortalRoleGroups.all,
  },
  {
    id: "listingDetailsAndEdit",
    path: `${dashboardRelPath}/listings/`,
    match: "prefix",
    roles: companyPortalRoleGroups.all,
  },
  {
    id: "applications",
    path: `${dashboardRelPath}/applications`,
    match: "exact",
    roles: companyPortalRoleGroups.all,
  },
  {
    id: "housingQueue",
    path: `${dashboardRelPath}/housing-queue`,
    match: "exact",
    roles: companyPortalRoleGroups.all,
  },
  {
    id: "analytics",
    path: `${dashboardRelPath}/analytics`,
    match: "exact",
    roles: companyPortalRoleGroups.managerAndAdmin,
  },
  {
    id: "productNews",
    path: `${dashboardRelPath}/product-news`,
    match: "exact",
    roles: companyPortalRoleGroups.all,
  },
  {
    id: "guides",
    path: `${dashboardRelPath}/guides`,
    match: "exact",
    roles: companyPortalRoleGroups.all,
  },
  {
    id: "settings",
    path: `${dashboardRelPath}/settings`,
    match: "exact",
    roles: companyPortalRoleGroups.all,
  },
  {
    id: "requirementProfiles",
    path: `${dashboardRelPath}/requirement-profiles`,
    match: "exact",
    roles: companyPortalRoleGroups.all,
  },
  {
    id: "users",
    path: `${dashboardRelPath}/users`,
    match: "exact",
    roles: companyPortalRoleGroups.managerAndAdmin,
  },
  {
    id: "companyProfile",
    path: `${dashboardRelPath}/profile`,
    match: "exact",
    roles: companyPortalRoleGroups.managerAndAdmin,
  },
] as const satisfies readonly CompanyPortalPageRule[];

export function normalizeCompanyPortalRole(roleName: string | null | undefined) {
  const normalizedRoleName = roleName?.trim().toUpperCase();
  if (!normalizedRoleName) return null;

  return roleAliases[normalizedRoleName] ?? null;
}

export function canCompanyPortalRoleAccess(
  roles: RoleList,
  roleName: string | null | undefined
) {
  const normalizedRole = normalizeCompanyPortalRole(roleName);
  return normalizedRole ? roles.includes(normalizedRole) : false;
}

export function getCompanyPortalNavSectionsForRole(
  roleName: string | null | undefined
): CompanyPortalNavSection[] {
  return companyPortalNavSections
    .map((section) => ({
      ...section,
      items: section.items
        .filter((item) => canCompanyPortalRoleAccess(item.roles, roleName))
        .map((item) => ({
          ...item,
          subItems: item.subItems?.filter((subItem) =>
            canCompanyPortalRoleAccess(subItem.roles, roleName)
          ),
        })),
    }))
    .filter((section) => section.items.length > 0);
}

export function getDefaultCompanyPortalPath(roleName: string | null | undefined) {
  for (const section of getCompanyPortalNavSectionsForRole(roleName)) {
    for (const item of section.items) {
      if (item.subItems?.length) {
        return item.subItems[0].path;
      }

      return item.path;
    }
  }

  return null;
}

export function isCompanyPortalPathAllowed(
  pathname: string,
  roleName: string | null | undefined
) {
  const normalizedPathname = normalizeRoute(pathname);
  const rule = companyPortalPageRules.find((entry) => {
    const normalizedRulePath = normalizeRoute(entry.path);

    if (entry.match === "exact") {
      return normalizedPathname === normalizedRulePath;
    }

    return (
      normalizedPathname === normalizedRulePath ||
      normalizedPathname.startsWith(`${normalizedRulePath}/`)
    );
  });

  if (!rule) {
    return false;
  }

  return canCompanyPortalRoleAccess(rule.roles, roleName);
}
