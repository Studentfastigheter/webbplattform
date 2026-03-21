import Container from "../Container";
import { StatisticProps } from "../../_statics/types";
import Trend from "../Trend";

export default function Statistic({
    Icon,
    data,     
    label,
    changeInPercent,
    increaseDirection = "up",
    ...props
  }: StatisticProps) {

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
        <Trend changeInPercent={changeInPercent} increaseDirection={increaseDirection} />
      </div>
    </Container>
  )
}
    