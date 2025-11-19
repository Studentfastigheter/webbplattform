import { Ellipsis } from "lucide-react";
import Container from "./Container";
import Link from "next/link";

export default function Statistic({
    columnSpan,
    icon,
    data,
    label,
    unit,
    background
  }: {
    columnSpan: number,
    icon: React.ReactElement,
    data: string,
    label: string,
    unit?: string,
    background: string
  }) {
  return (
    <Container columnSpan={columnSpan}>
      <div className="flex gap-4 items-center">
        <div className="p-4 rounded-full" style={{"backgroundColor": background}}>
            {icon}
        </div>
        <div>
            <p className="text-3xl font-bold">{data}
            {unit ? <span className="text-lg font-medium ml-0.5 relative bottom-2   ">{unit}</span> : <></>}
            </p>
            <p className="text-sm text-neutral-700">{label}</p>
        </div>
      </div>

      <Link className="absolute top-2 right-3" href="">
          <Ellipsis />
      </Link>
    </Container>
  )
}
    