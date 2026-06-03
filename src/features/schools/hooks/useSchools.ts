"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query/keys";
import { schoolService } from "@/features/schools/services/school-service";
import type { School } from "@/types";

// School list is essentially reference data — keep it warm.
const STALE_10_MINUTES = 10 * 60_000;

export function useSchools(q?: string) {
  return useQuery<School[]>({
    queryKey: qk.schools.list(q),
    queryFn: ({ signal }) => schoolService.list(q, { signal }),
    staleTime: STALE_10_MINUTES,
  });
}
