"use client";

import { Box, House, ScrollText, Users } from "lucide-react";
import AddStatistic from "./AddStatistic";
import Statistic from "./Statistic";
import { useState } from "react";
import { StatisticProps } from "../_statics/types";

type StatisticsContainerProps = {
    statistics?: StatisticProps[];
};

export default function StatisticsContainer({
    statistics,
}: StatisticsContainerProps) {
     // List with IDs of shown statistics
    const [shownStatistics, setShownStatistics] = useState<string[]>([])

    return (
        <div className="grid grid-cols-12 md:grid-cols-9">
            <Statistic className="col-span-2" background="#C7D8EB" icon={<Box size={14} className="text-neutral-400" />} label="Antal objekt" data="40" changeInPercent={3.4} />
            <Statistic className="col-span-2" background="#F4D8E4" icon={<House size={14} className="text-neutral-400" />} label="Lediga bostäder" data="12" changeInPercent={-2.5} increaseDirection="down" />
            <Statistic className="col-span-2" background="#C9D9C2" icon={<Users size={14} className="text-neutral-400" />} label="Antal hyresgäster" data="1225" changeInPercent={-2.5}/>
            <Statistic className="col-span-2" background="#C7D8EB" icon={<ScrollText size={14} className="text-neutral-400" />} label="Aktiva annonser" data="4" changeInPercent={2.5} />
            <AddStatistic shownStatistics={shownStatistics} />

        </div>
    )
}