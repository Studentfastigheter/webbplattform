import { QueryClient, type DefaultOptions } from "@tanstack/react-query";

export const QUERY_DEFAULT_STALE_TIME_MS = 30_000;
export const QUERY_DEFAULT_GC_TIME_MS = 5 * 60_000;

export const queryDefaultOptions = {
  queries: {
    staleTime: QUERY_DEFAULT_STALE_TIME_MS,
    gcTime: QUERY_DEFAULT_GC_TIME_MS,
    retry: 1,
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
