import QueueDetailPageClient from "./QueueDetailPageClient";

import { queueService } from "@/features/queues/services/queue-service";
import { PrefetchedQueryBoundary } from "@/lib/query/PrefetchedQueryBoundary";
import { qk } from "@/lib/query/keys";

const COMPANY_LISTINGS_PAGE_SIZE = 6;

type QueueDetailPageProps = {
  params: Promise<{ id: string }>;
};

function parseCompanyId(value: string) {
  const companyId = Number(value);
  return Number.isFinite(companyId) && companyId > 0 ? companyId : null;
}

export default async function QueueDetailPage({ params }: QueueDetailPageProps) {
  const { id } = await params;
  const companyId = parseCompanyId(id);

  return (
    <PrefetchedQueryBoundary
      prefetch={async (queryClient) => {
        if (companyId === null) {
          return;
        }

        await Promise.allSettled([
          queryClient.prefetchQuery({
            queryKey: qk.queues.company(companyId),
            queryFn: () => queueService.getCompany(companyId),
          }),
          queryClient.prefetchQuery({
            queryKey: qk.queues.byCompany(companyId),
            queryFn: () => queueService.getByCompany(companyId),
          }),
          queryClient.prefetchQuery({
            queryKey: qk.queues.companyListingsPage(
              companyId,
              0,
              COMPANY_LISTINGS_PAGE_SIZE,
            ),
            queryFn: () =>
              queueService.getCompanyListingsPage(
                companyId,
                0,
                COMPANY_LISTINGS_PAGE_SIZE,
              ),
          }),
        ]);
      }}
    >
      <QueueDetailPageClient />
    </PrefetchedQueryBoundary>
  );
}
