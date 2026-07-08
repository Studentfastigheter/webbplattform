import { dehydrate, HydrationBoundary, type QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { createQueryClient } from "@/lib/query/create-query-client";

type PrefetchedQueryBoundaryProps = {
  children: ReactNode;
  prefetch?: (queryClient: QueryClient) => Promise<void> | void;
  /**
   * "block" väntar in hela prefetchen innan sidan renderas — rätt när sidan
   * saknar eget laddningstillstånd eller när senare prefetches beror på
   * svaret från tidigare (dehydrate ser bara queries som startats synkront).
   *
   * "stream" skickar sidans skal direkt och dehydrerar pågående queries;
   * promisen streamas via RSC-payloaden och klienten tar över när svaret
   * kommer. Kräver att alla prefetchQuery-anrop startas synkront i callbacken
   * och att klientkomponenten själv renderar skelett för ytorna som väntar.
   */
  strategy?: "block" | "stream";
};

export async function PrefetchedQueryBoundary({
  children,
  prefetch,
  strategy = "block",
}: PrefetchedQueryBoundaryProps) {
  const queryClient = createQueryClient();

  if (prefetch) {
    if (strategy === "block") {
      await prefetch(queryClient);
    } else {
      Promise.resolve(prefetch(queryClient)).catch(() => undefined);
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
