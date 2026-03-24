
import { StatisticProps } from "../../_statics/types"
import StatisticClient from "./StatisticClient"

export default async function StatisticsContent({
  statisticsPromise,
}: {
  statisticsPromise: Promise<StatisticProps[]>
}) {
  const stats = await statisticsPromise

  return (
    <StatisticClient stats={stats} />
  )
}
