"use client";

import {
  AnalyticsBlock,
  AnalyticsGrid,
} from "@/features/analytics/components/AnalyticsBlocks";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";
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
import PortalPageHeader from "../_components/shared/PortalPageHeader";

export default function Analytics() {
  const { locale } = useI18n();

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title={localizedText(locale, "Analys", "Analytics")}
        description={localizedText(locale, "\u00d6verblick av ans\u00f6kningar, visningar och demografi.", "Overview of applications, views and demographics.")}
      />

      <AnalyticsGrid>
        <div className="sm:col-span-2 xl:col-span-2">
          <AnalyticsGeneralStats variant="analytics" />
        </div>
        <AnalyticsFunnelBlock size="2x4" />
        <AnalyticsStatusBreakdownBlock size="2x4" />
        <AnalyticsBlock size="2x2" title={localizedText(locale, "Ans\u00f6kningstrend", "Application trend")}>
          <AnalyticsApplicationsTrend
            embedded
            showHeader={false}
            showSummary={false}
          />
        </AnalyticsBlock>
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
