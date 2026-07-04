import { QueryClient, type DefaultOptions } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client";

export const QUERY_DEFAULT_STALE_TIME_MS = 30_000;
export const QUERY_DEFAULT_GC_TIME_MS = 5 * 60_000;

/**
 * En retry döljer transienta blippar (nätverk/5xx), men 4xx är deterministiska
 * — ogiltig token, saknad resurs, valideringsfel — och en retry är bara en
 * dömd extra rundresa som fördröjer felmeddelandet.
 */
function retryOnceExceptClientErrors(failureCount: number, error: unknown) {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false;
  }

  return failureCount < 1;
}

export const queryDefaultOptions = {
  queries: {
    staleTime: QUERY_DEFAULT_STALE_TIME_MS,
    gcTime: QUERY_DEFAULT_GC_TIME_MS,
    retry: retryOnceExceptClientErrors,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  },
  mutations: {
    retry: 0,
  },
} satisfies DefaultOptions;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: queryDefaultOptions,
  });
}
