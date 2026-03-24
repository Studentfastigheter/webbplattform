import { MoveRight, TrendingDown, TrendingUp } from "lucide-react";

type TrendProps = {
    changeInPercent: number;
    increaseDirection?: "up" | "down";
    showNumbers?: boolean;
}

export default function Trend({
    changeInPercent,
    increaseDirection = "up",
    showNumbers = true,
}: TrendProps) {

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

          {showNumbers && (
            <p className="text-xs font-medium">{changeInPercent.toString().replace(".", ",")} %</p>
          )}
        </div>
    )
}