"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query/keys";
import { mediaService } from "@/features/media/services/media-service";

const STALE_5_MINUTES = 5 * 60_000;

export function useCompanyPublicMedia(
  companyId: number | null | undefined
) {
  return useQuery<string[]>({
    queryKey: qk.media.companyPublic(companyId ?? -1),
    queryFn: () => mediaService.listCompanyPublic(companyId!),
    enabled: companyId != null && companyId > 0,
    staleTime: STALE_5_MINUTES,
  });
}

export function useUploadCompanyPublicMedia() {
  const qc = useQueryClient();

  return useMutation<
    string,
    Error,
    { companyId: number; file: File; mediaType?: string }
  >({
    mutationFn: ({ companyId, file, mediaType }) =>
      mediaService.uploadCompanyPublic(companyId, file, { mediaType }),
    onSettled: (_data, _err, { companyId }) => {
      qc.invalidateQueries({ queryKey: qk.media.companyPublic(companyId) });
    },
  });
}
