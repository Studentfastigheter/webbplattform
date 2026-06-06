"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query/keys";
import { mediaService } from "@/features/media/services/media-service";

const STALE_5_MINUTES = 5 * 60_000;

export function useCompanyPublicMedia(
  companyId: number | null | undefined
) {
  return useQuery<string[]>({
    queryKey: qk.media.companyPublic(companyId ?? -1),
    queryFn: ({ signal }) =>
      mediaService.listCompanyPublic(companyId!, { signal }),
    enabled: companyId != null && companyId > 0,
    staleTime: STALE_5_MINUTES,
  });
}
