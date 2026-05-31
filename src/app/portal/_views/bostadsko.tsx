"use client";

import { useEffect, useState } from "react";
import { AnalyticsGrid } from "@/features/analytics/components/AnalyticsBlocks";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";
import { queueService } from "@/features/queues/services/queue-service";
import type { HousingQueueDTO } from "@/types/queue";
import {
  CompanyDemographyBlock,
} from "../_components/analytics/DemographicsEndpointBlocks";

export default function Bostadsko() {
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);
  const [queues, setQueues] = useState<HousingQueueDTO[]>([]);
  const [loadingQueues, setLoadingQueues] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !companyId) return;

    let active = true;
    setLoadingQueues(true);
    setError(null);

    queueService
      .getByCompany(companyId)
      .then((queueRows) => {
        if (!active) return;
        setQueues(queueRows);
      })
      .catch((requestError) => {
        if (!active) return;
        setQueues([]);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Kunde inte hämta bostadsköer."
        );
      })
      .finally(() => {
        if (active) setLoadingQueues(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, companyId]);

  if (authLoading || loadingQueues) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[520px] rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        Logga in för att se företagets bostadsköer.
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        Denna sida är bara tillgänglig för företagskonton.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {queues.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          Inga bostadsköer hittades för företaget.
        </div>
      ) : (
        <div>
          <main className="min-w-0 space-y-5">
            <AnalyticsGrid>
              <CompanyDemographyBlock
                deferUntilSelection
                description={null}
                title="Besökardemografi"
                useCompaniesQuery
              />
            </AnalyticsGrid>
          </main>
        </div>
      )}
    </div>
  );
}
