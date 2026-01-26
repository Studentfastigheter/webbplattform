"use client";

import { Box, Eye, FileUser, House, MousePointerClick, ScrollText, Users } from "lucide-react";
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
        <div className="grid grid-cols-12 md:grid-cols-8">
            <Statistic 
                className="col-span-3 md:col-span-2" 
                background="#C9D9C2" 
                icon={<FileUser size={14} className="text-neutral-400" />} 
                label="Ansökningar" 
                data="53" 
                changeInPercent={-2.5}
            />
            <Statistic 
                className="col-span-3 md:col-span-2" 
                background="#C7D8EB" 
                icon={<Eye size={14} className="text-neutral-400" />} 
                label="Visningar" 
                data="3789" 
                changeInPercent={3.4} 
            />
            <Statistic 
                className="col-span-3 md:col-span-2" 
                background="#F4D8E4" 
                icon={<MousePointerClick size={14} className="text-neutral-400" />} 
                label="Interaktioner" 
                data="1723" 
                changeInPercent={2.2} 
                increaseDirection="up" 
            />
            <Statistic 
                className="col-span-3 md:col-span-2" 
                background="#C7D8EB" 
                icon={<ScrollText size={14} className="text-neutral-400" />} 
                label="Aktiva annonser" 
                data="4" 
                changeInPercent={2.5} 
            />
            {/* <AddStatistic shownStatistics={shownStatistics} /> */}

        </div>
    )
}