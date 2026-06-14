"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";
import AnalyticsGeneralStats from "../analytics/AnalyticsGeneralStats";
import AnalyticsStatusBreakdownBlock from "../analytics/AnalyticsStatusBreakdownBlock";
import { PortalGrid, PortalPage } from "../shared/PortalGrid";
import PortalPageHeader from "../shared/PortalPageHeader";
import OverviewEngagementTrend from "./OverviewEngagementTrend";
import OverviewInsightSummary from "./OverviewInsightSummary";

export default function PortalOverview() {
  const { locale } = useI18n();

  return (
    <PortalPage>
      <PortalGrid>
        <AnalyticsGeneralStats size="1x1" />
        <OverviewEngagementTrend size="3x4" />
        <OverviewInsightSummary size="2x4" />
        <AnalyticsStatusBreakdownBlock size="2x4" />
      </PortalGrid>
    </PortalPage>
  );
}
