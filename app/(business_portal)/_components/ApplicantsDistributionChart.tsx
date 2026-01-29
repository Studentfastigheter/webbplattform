"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useRouter } from "next/navigation"

export const description = "A horizontal bar chart"


type ChartDataProps = {
    object: string;
    applications: number;
    href?: string;
}


const chartData: ChartDataProps[] = [
  { object: "Lgh 1000", applications: 324, href: "/portal/annonser/1" },
  { object: "Lgh 1001", applications: 123, href: "/portal/annonser/2" },
  { object: "Lgh 1002", applications: 105, href: "/portal/annonser/3" },
  { object: "Lgh 1003", applications: 94, href: "/portal/annonser/4" },
  { object: "Lgh 1004", applications: 78, href: "/portal/annonser/5" },
  { object: "Lgh 1005", applications: 32, href: "/portal/annonser/6" },
]

const chartConfig = {
  applications: {
    label: "Ansökningar",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig





type Props = {
    className?: string,
}

export default function ApplicantsDistributionChart({
    className,
}: Props) {

  const router = useRouter();



  return (
    <div className={className}>
        <Card className="m-2">
        <CardHeader>
            <CardTitle>Ansökningar per objekt</CardTitle>
            <CardDescription>Här visas dina objekt med flest ansökningar.</CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig}>
            <BarChart
                accessibilityLayer
                data={chartData}
                layout="vertical"
                margin={{
                    left: 0,
                    right: 16,
                }}
            >
                    <YAxis
                        dataKey="object"
                        type="category"
                        tickLine={false}
                        axisLine={false}
                        width={70}
                    />
                    <XAxis dataKey="applications" type="number" hide />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent className="w-38" hideLabel />}
                    />
                    <Bar 
                        dataKey="applications" 
                        layout="vertical" 
                        radius={5} 
                        fill="var(--chart-1)"
                        className="cursor-pointer"
                        onClick={(data) => {
                            if (data?.payload?.href) {
                                router.push(data.payload.href)
                            }
                        }}
                    >
                        <LabelList 
                            dataKey="applications" 
                            position="right" 
                            offset={8}
                            className="fill-foreground" 
                            fontSize={12}
                        />
                    </Bar>
            </BarChart>
            </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 leading-none font-medium">
            Trendar uppåt med 3,8% denna månad <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
            Visar nya ansökningar för de senaste 6 månaderna
            </div>
        </CardFooter>
        </Card>
    </div>
  )
}
