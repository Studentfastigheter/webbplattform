import AllQueuesPageClient from "./AllQueuesPageClient";

import { companyService } from "@/features/companies/services/company-service";
import { PrefetchedQueryBoundary } from "@/lib/query/PrefetchedQueryBoundary";
import { qk } from "@/lib/query/keys";

export default function AllQueuesPage() {
  return (
    <PrefetchedQueryBoundary
      prefetch={async (queryClient) => {
        await queryClient.prefetchQuery({
          queryKey: qk.companies.list(),
          queryFn: () => companyService.listCompanies({}),
        });
      }}
    >
      <AllQueuesPageClient />
    </PrefetchedQueryBoundary>
  );
}
