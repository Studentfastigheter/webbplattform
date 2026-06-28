"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

import { createQueryClient } from "@/lib/query/create-query-client";

/**
 * Defaults rationale:
 * - staleTime 30s: removes the per-page re-fetch of stable lists (favorites,
 *   queues, company listings). 30s is short enough that mutations + manual
 *   invalidations stay authoritative, long enough to coalesce navigation.
 * - gcTime 5m: keeps cache around long enough for back/forward without bloat.
 * - refetchOnWindowFocus false: opt-in per query. The current UX is pull-based;
 *   we don't want every tab focus to thunder the API.
 * - retry 1 on queries, 0 on mutations: queries are idempotent reads, one
 *   retry hides transient blips. Mutations should never silently retry — the
 *   call-site handles the error and decides what to do.
 */
type QueryProviderProps = {
  children: ReactNode;
};

export function QueryProvider({ children }: QueryProviderProps) {
  // useState (not useMemo) so the client is stable across re-renders AND not
  // shared between concurrent requests on the server. This is the pattern the
  // TanStack Query Next.js docs recommend.
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" ? (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      ) : null}
    </QueryClientProvider>
  );
}
