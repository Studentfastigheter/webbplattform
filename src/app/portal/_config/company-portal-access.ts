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
import type { SystemProvider } from "@/types/common";
import { dashboardRelPath } from "../_statics/variables";

export const companyPortalRoles = ["Agent", "Manager", "Admin"] as const;

export type CompanyPortalRole = (typeof companyPortalRoles)[number];
export type CompanyPortalSystemProvider = SystemProvider | string | null | undefined;

export type CompanyPortalFeature =
  | "overview"
  | "listings"
  | "listingDetailsAndEdit"
  | "applications"
  | "housingQueue"
  | "analytics"
  | "productNews"
  | "guides"
  | "settings"
  | "requirementProfiles"
  | "users"
  | "companyProfile"
  | "listingCreate"
  | "listingImport"
  | "listingSync"
  | "applicationManagement"
  | "profileEdit"
  | "userManagement";

export type CompanyPortalPolicy = {
  key: string;
  systemProvider: SystemProvider | null;
  variant: "standard" | "integrated" | "internal";
  labelSv: string;
  labelEn: string;
  shellClassName?: string;
  features: readonly CompanyPortalFeature[];
};

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
type FeatureList = readonly CompanyPortalFeature[];

type CompanyPortalNavBadge = {
  labelSv: string;
  labelEn: string;
  tone?: "beta";
};

export type CompanyPortalNavItem = {
  id: CompanyPortalFeature;
  nameSv: string;
  nameEn: string;
  path: string;
  icon: LucideIcon;
  roles: RoleList;
  badge?: CompanyPortalNavBadge;
  comingSoon?: boolean;
  subItems?: readonly {
    id: CompanyPortalFeature;
    nameSv: string;
    nameEn: string;
    path: string;
    roles: RoleList;
    badge?: CompanyPortalNavBadge;
    comingSoon?: boolean;
  }[];
};

export type CompanyPortalNavSection = {
  key: string;
  titleSv: string;
  titleEn: string;
  items: readonly CompanyPortalNavItem[];
};

export type CompanyPortalPageRule = {
  id: CompanyPortalFeature;
  path: string;
  match: "exact" | "prefix";
  roles: RoleList;
};

const systemProviderValues = [
  "HOGIA",
  "PIGELLO",
  "DEMO",
  "MOMENTUM",
  "FAST2",
  "HOGIA_LANDLORD",
] as const satisfies readonly SystemProvider[];

const basePortalFeatures = [
  "overview",
  "listings",
  "listingDetailsAndEdit",
  "applications",
  "housingQueue",
  "analytics",
  "productNews",
  "guides",
  "settings",
  "requirementProfiles",
  "users",
  "companyProfile",
  "listingCreate",
  "listingImport",
  "profileEdit",
  "userManagement",
] as const satisfies FeatureList;

const managedPortalFeatures = [
  ...basePortalFeatures,
  "applicationManagement",
] as const satisfies FeatureList;

const providerSyncedPortalFeatures = [
  ...basePortalFeatures,
  "listingSync",
] as const satisfies FeatureList;

const companyPortalComingSoonFeatures = [
  "productNews",
  "guides",
] as const satisfies FeatureList;

const defaultPortalPolicy: CompanyPortalPolicy = {
  key: "default",
  systemProvider: null,
  variant: "standard",
  labelSv: "Standard",
  labelEn: "Standard",
  shellClassName: "portal-provider-standard",
  features: managedPortalFeatures,
};

const companyPortalProviderPolicies = {
  HOGIA: {
    key: "hogia",
    systemProvider: "HOGIA",
    variant: "integrated",
    labelSv: "Hogia",
    labelEn: "Hogia",
    shellClassName: "portal-provider-hogia",
    features: providerSyncedPortalFeatures,
  },
  HOGIA_LANDLORD: {
    key: "hogia-landlord",
    systemProvider: "HOGIA_LANDLORD",
    variant: "internal",
    labelSv: "Hogia Landlord",
    labelEn: "Hogia Landlord",
    shellClassName: "portal-provider-hogia-landlord",
    features: providerSyncedPortalFeatures,
  },
  DEMO: {
    key: "demo",
    systemProvider: "DEMO",
    variant: "standard",
    labelSv: "Demo",
    labelEn: "Demo",
    shellClassName: "portal-provider-demo",
    features: managedPortalFeatures,
  },
  PIGELLO: {
    key: "pigello",
    systemProvider: "PIGELLO",
    variant: "integrated",
    labelSv: "Pigello",
    labelEn: "Pigello",
    shellClassName: "portal-provider-pigello",
    features: managedPortalFeatures,
  },
  MOMENTUM: {
    key: "momentum",
    systemProvider: "MOMENTUM",
    variant: "integrated",
    labelSv: "Momentum",
    labelEn: "Momentum",
    shellClassName: "portal-provider-momentum",
    features: managedPortalFeatures,
  },
  FAST2: {
    key: "fast2",
    systemProvider: "FAST2",
    variant: "integrated",
    labelSv: "Fast2",
    labelEn: "Fast2",
    shellClassName: "portal-provider-fast2",
    features: managedPortalFeatures,
  },
} as const satisfies Record<SystemProvider, CompanyPortalPolicy>;

export function normalizeCompanyPortalSystemProvider(
  systemProvider: CompanyPortalSystemProvider
): SystemProvider | null {
  if (typeof systemProvider !== "string") {
    return null;
  }

  const normalized = systemProvider.trim().toUpperCase();
  if (!normalized) {
    return null;
  }

  return systemProviderValues.includes(normalized as SystemProvider)
    ? (normalized as SystemProvider)
    : null;
}

export function getCompanyPortalPolicy(
  systemProvider: CompanyPortalSystemProvider
): CompanyPortalPolicy {
  const normalizedProvider = normalizeCompanyPortalSystemProvider(systemProvider);
  return normalizedProvider
    ? companyPortalProviderPolicies[normalizedProvider]
    : defaultPortalPolicy;
}

export function canCompanyPortalProviderUseFeature(
  systemProvider: CompanyPortalSystemProvider,
  feature: CompanyPortalFeature
) {
  return getCompanyPortalPolicy(systemProvider).features.includes(feature);
}

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
        badge: {
          labelSv: "Beta",
          labelEn: "Beta",
          tone: "beta",
        },
      },
      {
        id: "productNews",
        nameSv: "Produktnyheter",
        nameEn: "Product news",
        path: `${dashboardRelPath}/product-news`,
        icon: Newspaper,
        roles: companyPortalRoleGroups.all,
        comingSoon: true,
      },
      {
        id: "guides",
        nameSv: "Guider",
        nameEn: "Guides",
        path: `${dashboardRelPath}/guides`,
        icon: BookOpen,
        roles: companyPortalRoleGroups.all,
        comingSoon: true,
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
    id: "listingCreate",
    path: `${dashboardRelPath}/listings/new`,
    match: "prefix",
    roles: companyPortalRoleGroups.managerAndAdmin,
  },
  {
    id: "listingImport",
    path: `${dashboardRelPath}/listings/import`,
    match: "exact",
    roles: companyPortalRoleGroups.managerAndAdmin,
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

export function isCompanyPortalFeatureComingSoon(
  feature: CompanyPortalFeature
) {
  return (companyPortalComingSoonFeatures as readonly CompanyPortalFeature[]).includes(
    feature
  );
}

export function getCompanyPortalNavSectionsForRole(
  roleName: string | null | undefined,
  systemProvider?: CompanyPortalSystemProvider
): CompanyPortalNavSection[] {
  return companyPortalNavSections
    .map((section) => ({
      ...section,
      items: section.items
        .filter(
          (item) =>
            canCompanyPortalRoleAccess(item.roles, roleName) &&
            canCompanyPortalProviderUseFeature(systemProvider, item.id)
        )
        .map((item) => ({
          ...item,
          subItems: item.subItems?.filter((subItem) =>
            canCompanyPortalRoleAccess(subItem.roles, roleName) &&
            canCompanyPortalProviderUseFeature(systemProvider, subItem.id)
          ),
        })),
    }))
    .filter((section) => section.items.length > 0);
}

export function getDefaultCompanyPortalPath(
  roleName: string | null | undefined,
  systemProvider?: CompanyPortalSystemProvider
) {
  for (const section of getCompanyPortalNavSectionsForRole(roleName, systemProvider)) {
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
  roleName: string | null | undefined,
  systemProvider?: CompanyPortalSystemProvider
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

  return (
    !isCompanyPortalFeatureComingSoon(rule.id) &&
    canCompanyPortalRoleAccess(rule.roles, roleName) &&
    canCompanyPortalProviderUseFeature(systemProvider, rule.id)
  );
}
