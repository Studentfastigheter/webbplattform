"use client";

import { useEffect, useState } from "react";
import { StatisticProps } from "../../_statics/types"
import StatisticClient from "./StatisticClient"

export default function StatisticsContent({
  statisticsPromise,
}: {
  statisticsPromise: Promise<StatisticProps[]>
}) {
  const [stats, setStats] = useState<StatisticProps[]>([]);

  useEffect(() => {
    (async () => setStats(await statisticsPromise))();
  }, []);

  return (
    <StatisticClient stats={stats}/>
  )
}
