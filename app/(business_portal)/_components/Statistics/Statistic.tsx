import { MoveRight, TrendingDown, TrendingUp } from "lucide-react";
import Container from "../Container";
import { StatisticProps } from "../../_statics/types";

export default function Statistic({
    Icon,
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
      else if (changeInPercent < 0 && increaseDirection === "down") {
          return "text-green-600";
      } else {
        return "text-neutral-600"
      }
  }

  const changeColorClass = getChangeDirectionColor();


  return (
    <Container padding={"sm"} {...props}>
      <div className="flex gap-2 text-sm text-neutral-400 mb-2">
        <Icon size={14} className="text-neutral-400" />
        <p className="tracking-wide">{label}</p>
      </div>
      <div className="flex gap-2">
        <p className="text-brand text-2xl/[24px] font-bold">
          {Number(data).toLocaleString("sv-SE")}
        </p>
        <div className={`flex gap-1 items-end ${changeColorClass}`}>
          {changeInPercent > 0 && (
            <TrendingUp size={20} color="currentColor" />
          )} 
          {(changeInPercent < 0) && (
            <TrendingDown size={20} color="currentColor" />
          )}
          {(changeInPercent === 0) && (
            <MoveRight size={20} color="currentColor" />
          )}

          <p className="text-xs font-medium">{changeInPercent.toString().replace(".", ",")} %</p>
        </div>
      </div>
    </Container>
  )
}
    