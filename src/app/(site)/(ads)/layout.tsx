import type { ReactNode } from "react";

import AdColumnsLayout from "@/components/layout/AdColumnsLayout";
import { adService } from "@/features/ads/services/ad-service";
import { PrefetchedQueryBoundary } from "@/lib/query/PrefetchedQueryBoundary";
import { qk } from "@/lib/query/keys";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <PrefetchedQueryBoundary
      prefetch={(queryClient) => {
        // Medvetet inte awaitad: annonserna är aldrig värda att blockera
        // sidinnehållet för. Den pending queryn streamas till klienten
        // (se dehydrate-konfigen i create-query-client.ts) och annonserna
        // dyker upp när backend svarar.
        void queryClient.prefetchQuery({
          queryKey: qk.ads.current(),
          queryFn: () => adService.current(),
        });
      }}
    >
      <AdColumnsLayout>{children}</AdColumnsLayout>
    </PrefetchedQueryBoundary>
  );
}
