import {
  AnalyticsBlock,
  AnalyticsGrid,
} from "@/features/analytics/components/AnalyticsBlocks";
import ApplicationIntervalStats from "../_components/analytics/ApplicationIntervalStats";
import AnalyticsApplicationsByObjectBlock from "../_components/analytics/AnalyticsApplicationsByObjectBlock";
import AnalyticsApplicationsTrend from "../_components/analytics/AnalyticsApplicationsTrend";
import AnalyticsGeneralStats from "../_components/analytics/AnalyticsGeneralStats";
import AnalyticsResidentsOverview from "../_components/analytics/AnalyticsResidentsOverview";
import {
  CompanyDemographyBatchBlock,
  CompanyDemographyBlock,
  ApplicationDemographyPortfolioBlock,
  ListingDemographyBatchBlock,
} from "../_components/analytics/DemographicsEndpointBlocks";

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Analys</h1>
        <p className="mt-1 text-sm text-gray-500">
          Överblick av ansökningar, visningar och demografi.
        </p>
      </div>

      <AnalyticsGrid>
        {/* Application count + key metrics side-by-side */}
        <ApplicationIntervalStats />
        <AnalyticsBlock size="2x2">
          <AnalyticsGeneralStats variant="analytics" />
        </AnalyticsBlock>
        <AnalyticsBlock size="2x2" title="Ansökningstrend">
          <AnalyticsApplicationsTrend
            embedded
            showHeader={false}
            showSummary={false}
          />
        </AnalyticsBlock>

        {/* Residents trend + distribution */}
        <AnalyticsResidentsOverview />

        {/* Demographics: company profile + category breakdown */}
        <CompanyDemographyBlock />
        <CompanyDemographyBatchBlock />

        {/* Portfolio: listing-level breakdown */}
        <ListingDemographyBatchBlock />

        {/* Top listings by application count */}
        <AnalyticsApplicationsByObjectBlock />

        {/* Application demographics (per-listing) */}
        <ApplicationDemographyPortfolioBlock />
      </AnalyticsGrid>
    </div>
  );
}
