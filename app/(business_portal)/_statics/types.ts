export type Message = {
  id: number;
  text: string;
  read: boolean;
}

export type Property = {
  id: number;
  name: string;
  address: string;
  rent: number;
}

export type StatisticProps = React.HTMLAttributes<HTMLDivElement> & {
  icon: React.ReactElement,
  data: string,
  label: string,
  background: string,
  changeInPercent: number,
  increaseDirection?: "up" | "down",
}