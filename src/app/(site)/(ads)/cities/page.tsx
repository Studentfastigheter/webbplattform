import CitiesPageClient from "./CitiesPageClient";

import { cityService } from "@/features/cities/services/city-service";
import { PrefetchedQueryBoundary } from "@/lib/query/PrefetchedQueryBoundary";
import { qk } from "@/lib/query/keys";

export default function CitiesPage() {
  return (
    <PrefetchedQueryBoundary
      prefetch={async (queryClient) => {
        await queryClient.prefetchQuery({
          queryKey: qk.cities.list(),
          queryFn: () => cityService.list(),
        });
      }}
    >
      <CitiesPageClient />
    </PrefetchedQueryBoundary>
  );
}
