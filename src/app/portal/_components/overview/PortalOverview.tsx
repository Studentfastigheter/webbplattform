"use client";

import { AnalyticsGrid } from "@/features/analytics/components/AnalyticsBlocks";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";
import AnalyticsGeneralStats from "../analytics/AnalyticsGeneralStats";
import AnalyticsStatusBreakdownBlock from "../analytics/AnalyticsStatusBreakdownBlock";
import PortalPageHeader from "../shared/PortalPageHeader";
import OverviewEngagementTrend from "./OverviewEngagementTrend";
import OverviewInsightSummary from "./OverviewInsightSummary";

export default function PortalOverview() {
  const { locale } = useI18n();

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title={localizedText(locale, "\u00d6versikt", "Overview")}
        description={localizedText(
          locale,
          "Aff\u00e4rsl\u00e4ge, respons och pipeline f\u00f6r bostadsportf\u00f6ljen.",
          "Business position, response and pipeline for the housing portfolio."
        )}
      />

      <AnalyticsGrid>
        <OverviewInsightSummary />

        <div className="sm:col-span-2 xl:col-span-4">
          <AnalyticsGeneralStats />
        </div>

        <OverviewEngagementTrend size="3x4" />
        <AnalyticsStatusBreakdownBlock size="2x2" />
      </AnalyticsGrid>
    </div>
  );
}
