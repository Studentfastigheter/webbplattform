"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/Chart"
import Container from "./Container"

export const description = "A multiple bar chart"

const chartData = [
  { month: "Nov", occupancy: 85, income: 450000, duration: 8.2 },
  { month: "Dec", occupancy: 78, income: 390000, duration: 7.8 },
  { month: "Jan", occupancy: 82, income: 410000, duration: 8.5 },
  { month: "Feb", occupancy: 80, income: 400000, duration: 8.1 },
  { month: "Mar", occupancy: 88, income: 440000, duration: 8.9 },
  { month: "Apr", occupancy: 91, income: 455000, duration: 9.2 },
  { month: "May", occupancy: 93, income: 465000, duration: 9.5 },
  { month: "Jun", occupancy: 95, income: 475000, duration: 9.8 },
  { month: "Jul", occupancy: 97, income: 485000, duration: 10.1 },
  { month: "Aug", occupancy: 96, income: 480000, duration: 10.0 },
  { month: "Sep", occupancy: 94, income: 470000, duration: 9.7 },
  { month: "Oct", occupancy: 90, income: 450000, duration: 9.3 },
]

const chartConfig = {
  occupancy: {
    label: "Beläggningsgrad",
    color: "var(--chart-1)",
  },
  income: {
    label: "Intäkter",
    color: "var(--chart-2)",
  },
  duration: {
    label: "Uthyrningslängd",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export default function ChartBarMultiple({
  columnSpan,
}: {
  columnSpan: number,
}) {
  return (
    <Container columnSpan={columnSpan}>
      <h2 className="text-xl font-semibold text-slate-900 mb-4">Statistik senaste året</h2>
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <LineChart
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
            <YAxis yAxisId="left" hide />
            <YAxis yAxisId="middle" hide />
            <YAxis yAxisId="right" hide />
            <ChartTooltip 
              cursor={false} 
              content={<ChartTooltipContent />} 

            />
            <Line
              yAxisId="left"
              dataKey="occupancy"
              type="monotone"
              stroke="var(--color-occupancy)"
              strokeWidth={2}
              dot={true}
            />
            <Line
              yAxisId="middle"
              dataKey="income"
              type="monotone"
              stroke="var(--color-income)"
              strokeWidth={2}
              dot={true}
            />
            <Line
              yAxisId="right"
              dataKey="duration"
              type="monotone"
              stroke="var(--color-duration)"
              strokeWidth={2}
              dot={true}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>

        </ChartContainer>
    </Container>
  )
}
