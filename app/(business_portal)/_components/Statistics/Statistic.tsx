import Container from "../Container";
import { StatisticProps } from "../../_statics/types";
import Trend from "../Trend";
import { LucideIcon } from "lucide-react";

type StatisticViewProps = Omit<StatisticProps, "iconKey"> & {
  Icon: LucideIcon;
  timeFrame: string;
};

export default function Statistic({
    Icon,
    data,     
    label,
    changeInPercent,
    increaseDirection = "up",
    timeFrame,
    ...props
  }: StatisticViewProps) {

    const filteredData = data[timeFrame];
    const filteredChangeInPercent = changeInPercent[timeFrame];

  return (
    <Container padding={"sm"} {...props}>
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-500">
          <Icon size={18} />
        </div>
        <p className="text-theme-sm font-medium text-gray-500">{label}</p>
      </div>
      <div className="flex items-end gap-2">
        <p className="text-3xl font-semibold leading-none text-gray-900">
          {Number(filteredData).toLocaleString("sv-SE")}
        </p>
        <Trend changeInPercent={filteredChangeInPercent} increaseDirection={increaseDirection} />
      </div>
    </Container>
  )
}
    
