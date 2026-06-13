"use client";

import { AnalyticsGrid } from "@/features/analytics/components/AnalyticsBlocks";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";
import AnalyticsGeneralStats from "../analytics/AnalyticsGeneralStats";
import PortalPageHeader from "../shared/PortalPageHeader";
import OverviewEngagementTrend from "./OverviewEngagementTrend";

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

        <OverviewEngagementTrend size="3x4" />
      </AnalyticsGrid>
    </div>
  );
}
