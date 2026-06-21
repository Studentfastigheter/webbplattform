"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query/keys";
import {
  adService,
  type PlatformAd,
} from "@/features/ads/services/ad-service";

const ADS_STALE_TIME_MS = 5 * 60_000;

export function useCurrentAds() {
  return useQuery<PlatformAd[]>({
    queryKey: qk.ads.current(),
    queryFn: ({ signal }) => adService.current({ signal }),
    staleTime: ADS_STALE_TIME_MS,
  });
}
