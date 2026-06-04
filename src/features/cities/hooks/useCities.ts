"use client";

/**
 * Cities — TanStack Query hooks.
 *
 * The city detail endpoint returns a denormalized payload containing every
 * piece of data the city page renders: companies in the city, external
 * companies, schools, student activities, banner, etc. Caching it under a
 * single key per normalized city code means the page no longer needs three
 * parallel `useEffect`s (listings / city detail / favorites) — it can read
 * everything from queries that survive cross-page navigation.
 *
 * Why `normalizeCityCode`? "Göteborg" and "Goteborg" both refer to the same
 * city in the URL. Without normalization we'd cache them separately and
 * fetch twice. The service already canonicalizes the request, so we
 * canonicalize the cache key too.
 */

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { qk } from "@/lib/query/keys";
import { cityService, normalizeCityCode } from "@/features/cities/services/city-service";
import type { CityDetailedDTO } from "@/types/city";

const STALE_5_MINUTES = 5 * 60_000;

/**
 * Detailed view for one city (companies + external companies + schools +
 * student activities + banner). Reference-ish data — 5min staleTime is
 * deliberate; this page doesn't need second-by-second freshness.
 */
export function useCityDetail(
  code: string | null | undefined,
  options?: Omit<UseQueryOptions<CityDetailedDTO>, "queryKey" | "queryFn">,
) {
  const normalized = code ? normalizeCityCode(code) : "";
  return useQuery<CityDetailedDTO>({
    queryKey: qk.cities.detail(normalized),
    queryFn: () => cityService.get(normalized),
    enabled: Boolean(normalized),
    staleTime: STALE_5_MINUTES,
    ...options,
  });
}
