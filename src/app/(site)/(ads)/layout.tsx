import type { ReactNode } from "react";

import AdColumnsLayout from "@/components/layout/AdColumnsLayout";
import { adService } from "@/features/ads/services/ad-service";
import { PrefetchedQueryBoundary } from "@/lib/query/PrefetchedQueryBoundary";
import { qk } from "@/lib/query/keys";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <PrefetchedQueryBoundary
      prefetch={async (queryClient) => {
        await queryClient.prefetchQuery({
          queryKey: qk.ads.current(),
          queryFn: () => adService.current(),
        });
      }}
    >
      <AdColumnsLayout>{children}</AdColumnsLayout>
    </PrefetchedQueryBoundary>
  );
}
