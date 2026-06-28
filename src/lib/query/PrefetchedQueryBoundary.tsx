import { dehydrate, HydrationBoundary, type QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { createQueryClient } from "@/lib/query/create-query-client";

type PrefetchedQueryBoundaryProps = {
  children: ReactNode;
  prefetch?: (queryClient: QueryClient) => Promise<void> | void;
};

export async function PrefetchedQueryBoundary({
  children,
  prefetch,
}: PrefetchedQueryBoundaryProps) {
  const queryClient = createQueryClient();

  if (prefetch) {
    await prefetch(queryClient);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
