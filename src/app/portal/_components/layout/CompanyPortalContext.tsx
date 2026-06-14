"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import { useAuth } from "@/context/AuthContext";
import {
  useCompanyPrivate,
} from "@/features/companies/hooks/useCompanies";
import type { CompanyPrivateDTO } from "@/features/companies/services/company-service";
import { getActiveCompanyId } from "@/lib/company-access";
import {
  canCompanyPortalProviderUseFeature,
  getCompanyPortalPolicy,
  normalizeCompanyPortalSystemProvider,
  type CompanyPortalFeature,
  type CompanyPortalPolicy,
} from "../../_config/company-portal-access";

type CompanyPortalContextValue = {
  companyId: number | null;
  company: CompanyPrivateDTO | null;
  systemProvider: ReturnType<typeof normalizeCompanyPortalSystemProvider>;
  rawSystemProvider: CompanyPrivateDTO["systemProvider"] | null;
  policy: CompanyPortalPolicy;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  canUseFeature: (feature: CompanyPortalFeature) => boolean;
};

const CompanyPortalContext = createContext<CompanyPortalContextValue | null>(null);

export function CompanyPortalProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const companyQuery = useCompanyPrivate(companyId, {
    enabled: !authLoading && Boolean(user) && companyId != null && companyId > 0,
  });
  const company = companyQuery.data ?? null;
  const rawSystemProvider = company?.systemProvider ?? null;
  const systemProvider = normalizeCompanyPortalSystemProvider(rawSystemProvider);
  const policy = useMemo(
    () => getCompanyPortalPolicy(systemProvider),
    [systemProvider]
  );
  const canUseFeature = useCallback(
    (feature: CompanyPortalFeature) =>
      canCompanyPortalProviderUseFeature(systemProvider, feature),
    [systemProvider]
  );
  const value = useMemo<CompanyPortalContextValue>(
    () => ({
      companyId,
      company,
      systemProvider,
      rawSystemProvider,
      policy,
      isLoading:
        authLoading ||
        (companyId != null &&
          companyId > 0 &&
          (companyQuery.isLoading || (companyQuery.isFetching && !company))),
      isError: companyQuery.isError,
      error: companyQuery.error,
      canUseFeature,
    }),
    [
      authLoading,
      canUseFeature,
      company,
      companyId,
      companyQuery.error,
      companyQuery.isError,
      companyQuery.isFetching,
      companyQuery.isLoading,
      policy,
      rawSystemProvider,
      systemProvider,
    ]
  );

  return (
    <CompanyPortalContext.Provider value={value}>
      {children}
    </CompanyPortalContext.Provider>
  );
}

export function useCompanyPortal() {
  const context = useContext(CompanyPortalContext);
  if (!context) {
    throw new Error("useCompanyPortal must be used within CompanyPortalProvider");
  }

  return context;
}
