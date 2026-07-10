"use client";

import { useAdminGeographyStatistics } from "@/features/admin/hooks/useAdmin";
import { ActionShell } from "../../shared";
import { DistributionBarList } from "./DistributionBarList";
import { countryLabel, errorMessage, genderLabel } from "./helpers";

export function GeographyBlock() {
  const query = useAdminGeographyStatistics();

  return (
    <ActionShell
      title="Geografi & demografi"
      description="Var studenterna vill bo och vilka de är."
      method="GET"
      endpoint="/api/admin/statistics/geography"
    >
      {query.isError ? (
        <p className="mt-4 text-sm text-red-600">
          {errorMessage(query.error, "Kunde inte hämta geografistatistik.")}
        </p>
      ) : (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <DistributionBarList
            title="Toppstäder (stadsintressen)"
            items={query.data?.topCityInterests}
            loading={query.isLoading}
            footnote="En student räknas en gång per stad hen är intresserad av."
          />
          <DistributionBarList
            title="Studenter per land"
            items={query.data?.studentsPerCountry}
            loading={query.isLoading}
            labelFor={countryLabel}
          />
          <DistributionBarList
            title="Könsfördelning"
            items={query.data?.genderSplit}
            loading={query.isLoading}
            labelFor={genderLabel}
            footnote="Innehåller automatiskt härledda värden — betrakta som ungefärlig."
          />
        </div>
      )}
    </ActionShell>
  );
}
