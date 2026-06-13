"use client";

import { AnalyticsBlock, AnalyticsGrid } from "@/features/analytics/components/AnalyticsBlocks";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";
import AnalyticsApplicationsTrend from "../analytics/AnalyticsApplicationsTrend";
import AnalyticsGeneralStats from "../analytics/AnalyticsGeneralStats";
import PortalPageHeader from "../shared/PortalPageHeader";

export default function PortalOverview() {
  const { locale } = useI18n();

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title={localizedText(locale, "\u00d6versikt", "Overview")}
        description={localizedText(
          locale,
          "Snabb koll p\u00e5 ans\u00f6kningar, visningar och annonsaktivitet.",
          "A quick view of applications, views and listing activity."
        )}
      />

      <AnalyticsGrid>
        <div className="sm:col-span-2 xl:col-span-4">
          <AnalyticsGeneralStats />
        </div>

        <AnalyticsBlock size="2x2" title={localizedText(locale, "Ans\u00f6kningstrend", "Application trend")}>
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
