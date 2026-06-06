"use client";

import { AnalyticsGrid } from "@/features/analytics/components/AnalyticsBlocks";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";
import { getActiveCompanyId } from "@/lib/company-access";
import { useQueuesByCompany } from "@/features/queues/hooks/useQueues";
import {
  CompanyDemographyBlock,
} from "../_components/analytics/DemographicsEndpointBlocks";

export default function Bostadsko() {
  const { locale } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const companyId = getActiveCompanyId(user);

  // Company queues. Hook is enabled only when companyId is present, so the
  // auth-loading window doesn't fire requests we'll discard.
  const {
    data: queues = [],
    isLoading: queuesLoading,
    isError: isQueuesError,
    error: queuesErr,
  } = useQueuesByCompany(companyId);

  const error = isQueuesError && queuesErr
    ? queuesErr instanceof Error
      ? queuesErr.message
      : "Kunde inte hämta bostadsköer."
    : null;

  if (authLoading || queuesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[520px] rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        {localizedText(locale, "Logga in för att se företagets bostadsköer.", "Log in to view the company's housing queues.")}
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        {localizedText(locale, "Denna sida är bara tillgänglig för företagskonton.", "This page is only available for company accounts.")}
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
          {localizedText(locale, "Inga bostadsköer hittades för företaget.", "No housing queues were found for the company.")}
        </div>
      ) : (
        <div>
          <main className="min-w-0 space-y-5">
            <AnalyticsGrid>
              <CompanyDemographyBlock
                deferUntilSelection
                description={null}
                title={localizedText(locale, "Besökardemografi", "Visitor demographics")}
                useCompaniesQuery
              />
            </AnalyticsGrid>
          </main>
        </div>
      )}
    </div>
  );
}
