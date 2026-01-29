import { TrendingDown, TrendingUp } from "lucide-react";
import Container from "./Container";
import { StatisticProps } from "../_statics/types";

export default function Statistic({
    icon,
    data,
    label,
    changeInPercent,
    increaseDirection = "up",
    ...props
  }: StatisticProps) {


    function getChangeDirectionColor() {
      if (changeInPercent > 0 && increaseDirection === "up") {
          return "text-green-600";
      }
      else if (changeInPercent < 0 && increaseDirection === "up") {
          return "text-red-600";
      }
      else if (changeInPercent > 0 && increaseDirection === "down") {
          return "text-red-600";
      }
      else {
          return "text-green-600";
      }
  }

  const changeColorClass = getChangeDirectionColor();


  return (
    <Container padding={"sm"} {...props}>
      <div className="flex gap-2 text-sm text-neutral-400 mb-2">
        {icon}
        <p className="tracking-wide">{label}</p>
      </div>
      <div className="flex gap-2">
        <p className="text-brand text-2xl/[24px] font-bold">
          {Number(data).toLocaleString("sv-SE")}
        </p>
        <div className={`flex gap-1 items-end ${changeColorClass}`}>
          {changeInPercent > 0 && (
            <TrendingUp size={20} color="currentColor" />
          ) || (
            <TrendingDown size={20} color="currentColor" />
          )}

          <p className="text-xs font-medium">{changeInPercent.toString().replace(".", ",")} %</p>
        </div>
      </div>
    </Container>
  )
}
    