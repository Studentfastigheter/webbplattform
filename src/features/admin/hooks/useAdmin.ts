"use client";

/**
 * Admin — TanStack Query hooks (Phase 3).
 *
 * The admin tools page mounts several sections in parallel. Before this
 * migration each section ran its own `useResourceList` (custom `useEffect`
 * + setState pair) with no sharing or auto-invalidation; mutations had to
 * manually trigger `refresh()` to update the table.
 *
 * After: every read is a TanStack query keyed under `qk.admin.*`, every
 * write is a TanStack mutation that owns its own invalidation, and reads
 * are shared across the page (e.g. the schools list is fetched once even
 * when both SchoolsForm and ActivitiesForm consume it).
 *
 * Mutation conventions in this file mirror Phase 2:
 *   - Mutations own invalidation. Callers should NOT call qc.invalidate.
 *   - `onSettled` (not `onSuccess`) so we re-fetch after failed writes.
 *   - We don't optimistically patch admin lists — admin operations are rare
 *     and the resulting list often needs server-derived fields (ids,
 *     timestamps); a brief load on success is acceptable.
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { qk } from "@/lib/query/keys";
import { adminService } from "@/features/admin/services/admin-service";
import type {
  AdminAddSchoolRequest,
  AdminCityPayload,
  AdminCompanyCredentialDTO,
  AdminCompanyDetailedDTO,
  AdminCompanyPublicDTO,
  AdminCompanyRole,
  AdminCompanyUserDTO,
  AdminCreateCompanyRequest,
  AdminCreateCompanyUserRequest,
  AdminCreatePOIRequest,
  AdminListingTagDetailDTO,
  AdminLocationCategoryDTO,
  AdminModifyPOIRequest,
  AdminPointOfInterestDTO,
  AdminUserTrendDTO,
  AdminWaitlistStatsDTO,
  CityDTO,
  CityDetailedDTO,
  CreateCityRequest,
  ModifyCityRequest,
  School,
} from "@/types";
import type {
  CreateExternalCompanyRequest,
  ExternalCompanyDTO,
  ModifyExternalCompanyRequest,
} from "@/features/companies/services/company-service";

const STALE_30_SECONDS = 30_000;
const STALE_5_MINUTES = 5 * 60_000;

// ---------------------------------------------------------------------------
// READS
// ---------------------------------------------------------------------------

export function useAdminTags() {
  return useQuery<AdminListingTagDetailDTO[]>({
    queryKey: qk.admin.tags(),
    queryFn: () => adminService.getTags(),
    staleTime: STALE_5_MINUTES,
  });
}

/**
 * Admin schools list. Backed by the same upstream endpoint as portal
 * `useSchools`, but kept under the admin namespace because the admin page
 * does not need the locale-aware filter that the portal hook accepts.
 */
export function useAdminSchools() {
  return useQuery<School[]>({
    queryKey: qk.admin.schools(),
    queryFn: () => adminService.getSchools(),
    staleTime: STALE_5_MINUTES,
  });
}

/**
 * Plain list of city codes (strings) — used by the school + activity
 * select dropdowns. Different from `useAdminCitySummaries` which returns
 * full CityDTOs for the cities table.
 */
export function useAdminCityNames() {
  return useQuery<string[]>({
    queryKey: qk.admin.cityNames(),
    queryFn: () => adminService.getCities(),
    staleTime: STALE_5_MINUTES,
  });
}

export function useAdminCitySummaries() {
  return useQuery<CityDTO[]>({
    queryKey: qk.admin.citySummaries(),
    queryFn: () => adminService.getCitySummaries(),
    staleTime: STALE_5_MINUTES,
  });
}

export function useAdminCityDetail(code: string | null | undefined) {
  return useQuery<CityDetailedDTO>({
    queryKey: qk.admin.cityDetail(code ?? ""),
    queryFn: () => adminService.getCity(code!),
    enabled: Boolean(code),
    staleTime: STALE_30_SECONDS,
  });
}

export function useAdminLocationCategories() {
  return useQuery<AdminLocationCategoryDTO[]>({
    queryKey: qk.admin.locationCategories(),
    queryFn: () => adminService.getLocationCategories(),
    staleTime: STALE_5_MINUTES,
  });
}

export function useAdminActivities() {
  return useQuery<AdminPointOfInterestDTO[]>({
    queryKey: qk.admin.activities(),
    queryFn: () => adminService.getActivities(),
    staleTime: STALE_30_SECONDS,
  });
}

export function useAdminCompanies() {
  return useQuery<AdminCompanyPublicDTO[]>({
    queryKey: qk.admin.companies(),
    queryFn: () => adminService.getCompanies(),
    staleTime: STALE_30_SECONDS,
  });
}

export function useAdminCompanyDetail(companyId: number | null | undefined) {
  return useQuery<AdminCompanyDetailedDTO>({
    queryKey: qk.admin.companyDetail(companyId ?? -1),
    queryFn: () => adminService.getCompany(companyId!),
    enabled: companyId != null && companyId > 0,
    staleTime: STALE_30_SECONDS,
  });
}

export function useAdminCompanyRoles() {
  return useQuery<AdminCompanyRole[]>({
    queryKey: qk.admin.companyRoles(),
    queryFn: () => adminService.getCompanyRoles(),
    staleTime: STALE_5_MINUTES,
  });
}

export function useAdminCompanyUsers(companyId: number | null | undefined) {
  return useQuery<AdminCompanyUserDTO[]>({
    queryKey: qk.admin.companyUsers(companyId ?? -1),
    queryFn: () => adminService.getCompanyUsers(companyId!),
    enabled: companyId != null && companyId > 0,
    staleTime: STALE_30_SECONDS,
  });
}

export function useAdminExternalCompanies() {
  return useQuery<ExternalCompanyDTO[]>({
    queryKey: qk.admin.externalCompanies(),
    queryFn: () => adminService.getExternalCompanies(),
    staleTime: STALE_30_SECONDS,
  });
}

export function useAdminUserStatistics(
  options: { from?: string; to?: string } = {},
) {
  return useQuery<AdminUserTrendDTO[]>({
    queryKey: qk.admin.userStatistics(options.from, options.to),
    queryFn: () => adminService.getUserStatistics(options),
    staleTime: STALE_30_SECONDS,
  });
}

export function useAdminWaitlistStats() {
  return useQuery<AdminWaitlistStatsDTO>({
    queryKey: qk.admin.waitlistStats(),
    queryFn: () => adminService.getWaitlistStats(),
    staleTime: STALE_30_SECONDS,
  });
}

// ---------------------------------------------------------------------------
// MUTATIONS
// ---------------------------------------------------------------------------

// ---- tags ----

export function useAdminCreateTag() {
  const qc = useQueryClient();
  return useMutation<void, Error, AdminListingTagDetailDTO>({
    mutationFn: (tag) => adminService.createTag(tag),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.admin.tags() });
      // The portal-side listings tag list reads from the same upstream
      // endpoint; dropping that cache too keeps the user-facing filter UI
      // in sync after a tag is created.
      qc.invalidateQueries({ queryKey: qk.listings.tags() });
    },
  });
}

export function useAdminModifyTag() {
  const qc = useQueryClient();
  return useMutation<void, Error, AdminListingTagDetailDTO>({
    mutationFn: (tag) => adminService.modifyTag(tag),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.admin.tags() });
      qc.invalidateQueries({ queryKey: qk.listings.tags() });
    },
  });
}

// ---- schools ----

export function useAdminCreateSchool() {
  const qc = useQueryClient();
  return useMutation<void, Error, AdminAddSchoolRequest>({
    mutationFn: (school) => adminService.createSchool(school),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.admin.schools() });
      // Portal /useSchools shares the same upstream — drop it too.
      qc.invalidateQueries({ queryKey: qk.schools.all });
    },
  });
}

export function useAdminCreateSchools() {
  const qc = useQueryClient();
  return useMutation<void, Error, AdminAddSchoolRequest[]>({
    mutationFn: (schools) => adminService.createSchools(schools),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.admin.schools() });
      qc.invalidateQueries({ queryKey: qk.schools.all });
    },
  });
}

export function useAdminModifySchool() {
  const qc = useQueryClient();
  return useMutation<void, Error, AdminAddSchoolRequest>({
    mutationFn: (school) => adminService.modifySchool(school),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.admin.schools() });
      qc.invalidateQueries({ queryKey: qk.schools.all });
    },
  });
}

// ---- location categories ----

export function useAdminAddLocationCategory() {
  const qc = useQueryClient();
  return useMutation<void, Error, AdminLocationCategoryDTO>({
    mutationFn: (category) => adminService.addLocationCategory(category),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.admin.locationCategories() });
    },
  });
}

export function useAdminModifyLocationCategory() {
  const qc = useQueryClient();
  return useMutation<void, Error, AdminLocationCategoryDTO>({
    mutationFn: (category) => adminService.modifyLocationCategory(category),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.admin.locationCategories() });
    },
  });
}

// ---- activities ----

export function useAdminCreateActivity() {
  const qc = useQueryClient();
  return useMutation<void, Error, AdminCreatePOIRequest>({
    mutationFn: (activity) => adminService.createActivity(activity),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.admin.activities() });
    },
  });
}

export function useAdminModifyActivity() {
  const qc = useQueryClient();
  return useMutation<void, Error, AdminModifyPOIRequest>({
    mutationFn: (activity) => adminService.modifyActivity(activity),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.admin.activities() });
    },
  });
}

export function useAdminDeleteActivity() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (activityId) => adminService.deleteActivity(activityId),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.admin.activities() });
    },
  });
}

// ---- companies ----

export function useAdminCreateCompany() {
  const qc = useQueryClient();
  return useMutation<void, Error, AdminCreateCompanyRequest>({
    mutationFn: (company) => adminService.createCompany(company),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.admin.companies() });
      // The portal /companies list reads from the same upstream — drop too.
      qc.invalidateQueries({ queryKey: qk.companies.list() });
    },
  });
}

export function useAdminModifyCompany() {
  const qc = useQueryClient();
  return useMutation<void, Error, AdminCreateCompanyRequest>({
    mutationFn: (company) => adminService.modifyCompany(company),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.admin.companies() });
      qc.invalidateQueries({ queryKey: qk.companies.list() });
    },
  });
}

export function useAdminDeleteCompany() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (companyId) => adminService.deleteCompany(companyId),
    onSettled: (_data, _err, companyId) => {
      qc.invalidateQueries({ queryKey: qk.admin.companies() });
      qc.invalidateQueries({ queryKey: qk.companies.list() });
      qc.removeQueries({ queryKey: qk.admin.companyDetail(companyId) });
      qc.removeQueries({ queryKey: qk.admin.companyUsers(companyId) });
    },
  });
}

export function useAdminRefreshCompanyListings() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (companyId) => adminService.refreshCompanyListings(companyId),
    onSettled: (_data, _err, companyId) => {
      qc.invalidateQueries({ queryKey: qk.admin.companies() });
      qc.invalidateQueries({
        queryKey: qk.queues.allCompanyListings(companyId, 0, 200),
      });
    },
  });
}

export function useAdminUpdateCompanyCredentials() {
  const qc = useQueryClient();
  return useMutation<
    void,
    Error,
    { companyId: number; credentials: AdminCompanyCredentialDTO }
  >({
    mutationFn: ({ companyId, credentials }) =>
      adminService.updateCompanyCredentials(companyId, credentials),
    onSettled: (_data, _err, { companyId }) => {
      qc.invalidateQueries({ queryKey: qk.admin.companyDetail(companyId) });
    },
  });
}

// ---- external companies ----

export function useAdminCreateExternalCompany() {
  const qc = useQueryClient();
  return useMutation<void, Error, CreateExternalCompanyRequest>({
    mutationFn: (payload) => adminService.createExternalCompany(payload),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.admin.externalCompanies() });
    },
  });
}

export function useAdminUpdateExternalCompany() {
  const qc = useQueryClient();
  // The service takes a single `ModifyExternalCompanyRequest` (the payload
  // already contains the id). We keep the {companyId, payload} call shape
  // here so consumer code reads naturally; the companyId arg is unused
  // at the service boundary but matches the verifyCompanyAccount /
  // deleteCompany call signatures elsewhere on the page.
  return useMutation<void, Error, ModifyExternalCompanyRequest>({
    mutationFn: (payload) => adminService.updateExternalCompany(payload),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.admin.externalCompanies() });
    },
  });
}

export function useAdminDeleteExternalCompany() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (companyId) => adminService.deleteExternalCompany(companyId),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.admin.externalCompanies() });
    },
  });
}

// ---- company accounts ----

export function useAdminManageCompanyAccount() {
  const qc = useQueryClient();
  return useMutation<
    void,
    Error,
    { companyId: number; payload: AdminCompanyUserDTO }
  >({
    mutationFn: ({ payload }) => adminService.manageCompanyAccount(payload),
    onSettled: (_data, _err, { companyId }) => {
      qc.invalidateQueries({ queryKey: qk.admin.companyUsers(companyId) });
    },
  });
}

export function useAdminCreateCompanyAdmin() {
  const qc = useQueryClient();
  return useMutation<
    void,
    Error,
    { companyId: number; payload: AdminCreateCompanyUserRequest }
  >({
    mutationFn: ({ companyId, payload }) =>
      adminService.createCompanyAdmin(companyId, payload),
    onSettled: (_data, _err, { companyId }) => {
      qc.invalidateQueries({ queryKey: qk.admin.companyUsers(companyId) });
      qc.invalidateQueries({ queryKey: qk.companies.users(companyId) });
    },
  });
}

export function useAdminVerifyCompanyAccount() {
  const qc = useQueryClient();
  return useMutation<
    void,
    Error,
    { companyId: number; accountId: number }
  >({
    mutationFn: ({ companyId, accountId }) =>
      adminService.verifyCompanyAccount(companyId, accountId),
    onSettled: (_data, _err, { companyId }) => {
      qc.invalidateQueries({ queryKey: qk.admin.companyUsers(companyId) });
    },
  });
}

// ---- cities ----

export function useAdminCreateCity() {
  const qc = useQueryClient();
  return useMutation<void, Error, CreateCityRequest>({
    mutationFn: (city) => adminService.createCity(city),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.admin.citySummaries() });
      qc.invalidateQueries({ queryKey: qk.admin.cityNames() });
      qc.invalidateQueries({ queryKey: qk.cities.list() });
    },
  });
}

export function useAdminModifyCity() {
  const qc = useQueryClient();
  return useMutation<void, Error, { code: string; payload: ModifyCityRequest }>({
    mutationFn: ({ code, payload }) => adminService.modifyCity(code, payload),
    onSettled: (_data, _err, { code }) => {
      qc.invalidateQueries({ queryKey: qk.admin.citySummaries() });
      qc.invalidateQueries({ queryKey: qk.admin.cityDetail(code) });
      qc.invalidateQueries({ queryKey: qk.cities.detail(code) });
      qc.invalidateQueries({ queryKey: qk.cities.list() });
    },
  });
}

export function useAdminDeleteCity() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (code) => adminService.deleteCity(code),
    onSettled: (_data, _err, code) => {
      qc.invalidateQueries({ queryKey: qk.admin.citySummaries() });
      qc.invalidateQueries({ queryKey: qk.admin.cityNames() });
      qc.invalidateQueries({ queryKey: qk.cities.list() });
      qc.removeQueries({ queryKey: qk.admin.cityDetail(code) });
      qc.removeQueries({ queryKey: qk.cities.detail(code) });
    },
  });
}

// `useAdminCityPayloadAction` exists for the bulk delete-by-id form. The
// service still accepts the legacy `AdminCityPayload` (= `Record<string,
// unknown>`); we expose this for forward-compat but the new typed mutations
// above are preferred.
export function useAdminCityPayloadAction(
  action: (payload: AdminCityPayload) => Promise<void>,
) {
  const qc = useQueryClient();
  return useMutation<void, Error, AdminCityPayload>({
    mutationFn: (payload) => action(payload),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.admin.citySummaries() });
      qc.invalidateQueries({ queryKey: qk.admin.cityNames() });
      qc.invalidateQueries({ queryKey: qk.cities.list() });
    },
  });
}
