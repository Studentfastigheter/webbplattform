import { AnalyticsBlock, AnalyticsGrid } from "@/components/analytics/AnalyticsBlocks";
import AnalyticsApplicationsByObjectBlock from "../_components/AnalyticsApplicationsByObjectBlock";
import AnalyticsApplicationsTrend from "../_components/AnalyticsApplicationsTrend";
import AnalyticsGeneralStats from "../_components/AnalyticsGeneralStats";

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
        <AnalyticsBlock size="1x1" title="Ansökningar" />
        <AnalyticsBlock size="1x1" title="Konvertering" />
        <AnalyticsBlock size="2x2" title="Ansökningstrend">
          <AnalyticsApplicationsTrend
            embedded
            showHeader={false}
            showSummary={false}
          />
        </AnalyticsBlock>
        <AnalyticsBlock size="2x2" title="Traffic source" />
        <AnalyticsApplicationsByObjectBlock />
        <AnalyticsBlock size="1x1" title="Svarstid" />
        <AnalyticsBlock size="1x1" title="Kvalitet" />
      </AnalyticsGrid>
    </div>
  );
}
