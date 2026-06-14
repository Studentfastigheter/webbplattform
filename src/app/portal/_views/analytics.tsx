"use client";

import {
  AnalyticsGrid,
} from "@/features/analytics/components/AnalyticsBlocks";
import AnalyticsApplicationsByObjectBlock from "../_components/analytics/AnalyticsApplicationsByObjectBlock";
import AnalyticsApplicationsTrend from "../_components/analytics/AnalyticsApplicationsTrend";
import AnalyticsFunnelBlock from "../_components/analytics/AnalyticsFunnelBlock";
import AnalyticsGeneralStats from "../_components/analytics/AnalyticsGeneralStats";
import AnalyticsResidentsOverview from "../_components/analytics/AnalyticsResidentsOverview";
import AnalyticsStatusBreakdownBlock from "../_components/analytics/AnalyticsStatusBreakdownBlock";
import {
  CompanyDemographyBatchBlock,
  CompanyDemographyBlock,
  ApplicationDemographyPortfolioBlock,
  ListingDemographyBatchBlock,
} from "../_components/analytics/DemographicsEndpointBlocks";

export default function Analytics() {
  return (
    <div className="space-y-6">
      <AnalyticsGrid>
        <AnalyticsGeneralStats size="1x1" variant="analytics" />
        <AnalyticsFunnelBlock size="2x4" />
        <AnalyticsStatusBreakdownBlock size="2x4" />
        <AnalyticsApplicationsTrend size="2x2" showSummary={false} />
        <AnalyticsApplicationsByObjectBlock />

        <AnalyticsResidentsOverview />
        <CompanyDemographyBlock />
        <CompanyDemographyBatchBlock />
        <ListingDemographyBatchBlock />
        <ApplicationDemographyPortfolioBlock />
      </AnalyticsGrid>
    </div>
  );
}
