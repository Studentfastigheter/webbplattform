"use client";

import {
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { qk } from "@/lib/query/keys";
import { schoolService } from "@/features/schools/services/school-service";
import type { School } from "@/types";

// School list is essentially reference data — keep it warm.
const STALE_10_MINUTES = 10 * 60_000;

export function useSchools(
  q?: string,
  options?: Omit<UseQueryOptions<School[]>, "queryKey" | "queryFn">
) {
  const { enabled = true, ...restOptions } = options ?? {};

  return useQuery<School[]>({
    ...restOptions,
    queryKey: qk.schools.list(q),
    queryFn: () => schoolService.list(q),
    enabled,
    staleTime: STALE_10_MINUTES,
  });
}
