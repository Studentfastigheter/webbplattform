import { AvailableStatistics } from "@/lib/definitions"

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
  iconKey: AvailableStatistics,
  data: Record<string, number>,
  label: string,
  changeInPercent: Record<string, number>,
  increaseDirection?: "up" | "down",
}