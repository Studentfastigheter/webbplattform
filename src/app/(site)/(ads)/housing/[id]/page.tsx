import ListingDetailPageClient from "./ListingDetailPageClient";

import { listingService } from "@/features/listings/services/listing-service";
import { queueService } from "@/features/queues/services/queue-service";
import { PrefetchedQueryBoundary } from "@/lib/query/PrefetchedQueryBoundary";
import { qk } from "@/lib/query/keys";
import type { ListingDetailDTO } from "@/types/listing";

type ListingDetailPageProps = {
  params: Promise<{ id: string }>;
};

function companyIdFromListing(listing: ListingDetailDTO | undefined) {
  if (listing?.ownerType?.toLowerCase() !== "company") {
    return null;
  }

  const companyId = Number(listing.ownerId);
  return Number.isFinite(companyId) && companyId > 0 ? companyId : null;
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { id } = await params;

  return (
    <PrefetchedQueryBoundary
      prefetch={async (queryClient) => {
        let listing: ListingDetailDTO | undefined;

        await queryClient
          .prefetchQuery({
            queryKey: qk.listings.detail(id),
            queryFn: async () => {
              listing = await listingService.get(id);
              return listing;
            },
          })
          .catch(() => undefined);

        listing ??= queryClient.getQueryData<ListingDetailDTO>(qk.listings.detail(id));
        const requirementsProfileId = listing?.requirementsProfileId;
        const companyId = companyIdFromListing(listing);

        await Promise.allSettled([
          requirementsProfileId
            ? queryClient.prefetchQuery({
                queryKey: qk.listings.requirementsProfile(requirementsProfileId),
                queryFn: () => listingService.getRequirementsProfile(requirementsProfileId),
              })
            : undefined,
          companyId
            ? queryClient.prefetchQuery({
                queryKey: qk.queues.company(companyId),
                queryFn: () => queueService.getCompany(companyId),
              })
            : undefined,
        ]);
      }}
    >
      <ListingDetailPageClient />
    </PrefetchedQueryBoundary>
  );
}
