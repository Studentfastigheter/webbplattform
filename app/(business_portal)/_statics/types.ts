import { LucideIcon } from "lucide-react"

export type Message = {
  id: string
  text: string
  read: boolean
  createdAt: string
  kind?: "application" | "platform" | "insight"
  href?: string
}

export type Property = {
  id: number;
  name: string;
  address: string;
  rent: number;
}

export type StatisticProps = React.HTMLAttributes<HTMLDivElement> & {
  Icon: LucideIcon,
  data: number,
  label: string,
  changeInPercent: number,
  increaseDirection?: "up" | "down",
}