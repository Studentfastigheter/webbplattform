import { AnalyticsBlock, AnalyticsGrid } from "@/components/analytics/AnalyticsBlocks";
import AnalyticsApplicationsByObjectBlock from "../AnalyticsApplicationsByObjectBlock";
import AnalyticsApplicationsTrend from "../AnalyticsApplicationsTrend";
import AnalyticsGeneralStats from "../AnalyticsGeneralStats";

export default function PortalOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Översikt</h1>
      </div>

      <AnalyticsGrid>
        <AnalyticsBlock size="1x4">
          <AnalyticsGeneralStats />
        </AnalyticsBlock>

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
