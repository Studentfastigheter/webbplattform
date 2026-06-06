"use client";

/**
 * Ads — TanStack Query hooks.
 *
 * `getCurrentAds` is a public, low-churn payload (the marketing carousel).
 * Multiple layout components mount it concurrently; one shared cache entry
 * means one request per session no matter how many `<AdColumnsLayout>`s the
 * tree contains. Failures are swallowed silently inside the service
 * (returns `[]` on error) — we still treat `isError` as a no-ad state.
 */

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query/keys";
import {
  listingService,
  type RollingAd,
} from "@/features/listings/services/listing-service";

const STALE_5_MINUTES = 5 * 60_000;

export function useCurrentAds() {
  return useQuery<RollingAd[]>({
    queryKey: qk.ads.current(),
    queryFn: () => listingService.getCurrentAds(),
    staleTime: STALE_5_MINUTES,
  });
}
