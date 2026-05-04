import { AnalyticsBlock, AnalyticsGrid } from "@/components/analytics/AnalyticsBlocks";
import AnalyticsApplicationsByObjectBlock from "../_components/AnalyticsApplicationsByObjectBlock";
import AnalyticsApplicationsTrend from "../_components/AnalyticsApplicationsTrend";
import AnalyticsGeneralStats from "../_components/AnalyticsGeneralStats";
import AnalyticsResidentsOverview from "../_components/AnalyticsResidentsOverview";

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Analys</h1>
      </div>

      <AnalyticsGrid>
        <AnalyticsBlock size="1x2">
          <AnalyticsGeneralStats />
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
