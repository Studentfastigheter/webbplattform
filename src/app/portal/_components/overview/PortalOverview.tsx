"use client";

import { AnalyticsBlock, AnalyticsGrid } from "@/features/analytics/components/AnalyticsBlocks";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";
import AnalyticsApplicationsTrend from "../analytics/AnalyticsApplicationsTrend";
import AnalyticsGeneralStats from "../analytics/AnalyticsGeneralStats";

export default function PortalOverview() {
  const { locale } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {localizedText(locale, "Översikt", "Overview")}
        </h1>
      </div>

      <AnalyticsGrid>
        <AnalyticsBlock size="1x4">
          <AnalyticsGeneralStats />
        </AnalyticsBlock>

        <AnalyticsBlock size="2x2" title={localizedText(locale, "Ansökningstrend", "Application trend")}>
          <AnalyticsApplicationsTrend
            embedded
            showHeader={false}
            showSummary={false}
          />
        </AnalyticsBlock>
      </AnalyticsGrid>
    </div>
  );
}
