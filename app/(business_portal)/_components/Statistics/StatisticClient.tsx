"use client"
import { useState } from "react";
import { Eye, FileUser, MousePointerClick, ScrollText } from "lucide-react";
import { StatisticProps } from "../../_statics/types";
import Toggles from "../Toggles"
import Statistic from "./Statistic"

const ICON_BY_KEY = {
    applications: FileUser,
    views: Eye,
    interactions: MousePointerClick,
    active_posts: ScrollText,
} as const;

export default function StatisticClient({
    stats,
}: {
    stats: StatisticProps[];
}) {

    const [selectedTimeframe, setSelectedTimeframe] = useState("1w");

    return (
        <div>
            <div className="flex items-center m-2">
                <Toggles 
                    options={[
                        { value: "1w", ariaLabel: "1 vecka", label: "1 vecka" },
                        { value: "1m", ariaLabel: "1 månad", label: "1 mån" },
                        { value: "3m", ariaLabel: "3 månader", label: "3 mån" },
                        { value: "12m", ariaLabel: "12 månader", label: "12 mån" },
                    ]}
                    defaultValue="1w"
                    onValueChange={setSelectedTimeframe}
                    value={selectedTimeframe}
                />
            </div>
            <div className="grid grid-cols-12 md:grid-cols-8">
                {stats.map((s) => (
                    <Statistic
                        key={s.label}
                        className="col-span-3 md:col-span-2"
                        Icon={ICON_BY_KEY[s.iconKey]}
                        label={s.label}
                        data={s.data}
                        timeFrame={selectedTimeframe}
                        changeInPercent={s.changeInPercent}
                        increaseDirection={s.increaseDirection}
                    />
                ))}
            </div>
        </div>
    )
}
