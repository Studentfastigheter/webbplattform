import { AnalyticsBlock, AnalyticsGrid } from "@/components/analytics/AnalyticsBlocks";
import ApplicationIntervalStats from "../_components/analytics/ApplicationIntervalStats";
import AnalyticsApplicationsByObjectBlock from "../_components/analytics/AnalyticsApplicationsByObjectBlock";
import AnalyticsApplicationsTrend from "../_components/analytics/AnalyticsApplicationsTrend";
import AnalyticsGeneralStats from "../_components/analytics/AnalyticsGeneralStats";
import AnalyticsResidentsOverview from "../_components/analytics/AnalyticsResidentsOverview";

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Analys</h1>
      </div>

      <AnalyticsGrid>
        <ApplicationIntervalStats />
        <AnalyticsBlock size="2x2">
          <AnalyticsGeneralStats variant="analytics" />
        </AnalyticsBlock>
        <AnalyticsResidentsOverview />
        <AnalyticsBlock size="2x2" title="Ansökningstrend">
          <AnalyticsApplicationsTrend
            embedded
            showHeader={false}
            showSummary={false}
          />
        </AnalyticsBlock>
        <AnalyticsApplicationsByObjectBlock />
      </AnalyticsGrid>
    </div>
  );
}
