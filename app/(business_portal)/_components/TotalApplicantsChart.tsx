"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

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

export const description = "A line chart"

const chartData = [
  { month: "Januari", queuers: 186 },
  { month: "Februari", queuers: 305 },
  { month: "Mars", queuers: 237 },
  { month: "April", queuers: 73 },
  { month: "Maj", queuers: 209 },
  { month: "Juni", queuers: 214 },
]

const chartConfig = {
  queuers: {
    label: "Köande",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig



type Props = {
    className?: string,
}

export default function TotalApplicantsChart({
    className,
}: Props) {
  return (
    <div className={className}>
        <Card className="m-2">
            <CardHeader>
                <CardTitle>Nya ansökningar till bostadskö</CardTitle>
                <CardDescription>January - June 2025</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                <AreaChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                    left: 12,
                    right: 12,
                    }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={8}
                        tickCount={4}
                    />
                    <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                    />
                    <Area
                    dataKey="queuers"
                    type="natural"
                    fill="var(--chart-1)"
                    fillOpacity={0.4}
                    stroke="var(--chart-1)"
                    />
                </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                Trendar uppåt med 5,2% denna månad <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                Visar nya ansökningar för de senaste 6 månaderna
                </div>
            </CardFooter>
        </Card>
    </div>
  )
}
