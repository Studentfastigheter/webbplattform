import {
  QueryClient,
  defaultShouldDehydrateQuery,
  type DefaultOptions,
} from "@tanstack/react-query";

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
  dehydrate: {
    // Tar med pending-queries i dehydreringen så att en server-prefetch inte
    // måste awaitas: promisen streamas via RSC-payloaden och klienten tar
    // över när svaret kommer, i stället för att blockera hela sidrenderingen.
    shouldDehydrateQuery: (query) =>
      defaultShouldDehydrateQuery(query) || query.state.status === "pending",
  },
} satisfies DefaultOptions;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: queryDefaultOptions,
  });
}
