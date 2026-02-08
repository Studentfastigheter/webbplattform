import { StatisticProps } from "../../_statics/types"
import Statistic from "./Statistic"

export default async function StatisticsContent({
  statisticsPromise,
}: {
  statisticsPromise: Promise<StatisticProps[]>
}) {
  const stats = await statisticsPromise

  return (
    <div className="grid grid-cols-12 md:grid-cols-8">
      {stats.map((s) => (
        <Statistic
          key={s.label}
          className="col-span-3 md:col-span-2"
          Icon={s.Icon}
          label={s.label}
          data={s.data}
          changeInPercent={s.changeInPercent}
          increaseDirection={s.increaseDirection}
        />
      ))}
    </div>
  )
}
