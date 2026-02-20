import { Eye, FileUser, MousePointerClick, ScrollText } from "lucide-react";
import Statistic from "./Statistic";
import { StatisticProps } from "../../_statics/types";
import { Suspense } from "react";
import StatisticsSkeleton from "@/components/Dashboard/Skeletons";
import StatisticsContent from "./StatisticContent";

type StatisticsContainerProps = {
    statisticsPromise: Promise<StatisticProps[]>;
};

export default function StatisticsContainer({
    statisticsPromise,
}: StatisticsContainerProps) {
    

    return (
        <Suspense fallback={<StatisticsSkeleton count={4} className="col-span-3 md:col-span-2" />}>
            <StatisticsContent statisticsPromise={statisticsPromise} />
        </Suspense>
    )
}