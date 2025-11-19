"use client"
import { Label, Pie, PieChart } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/(business_portal)/_components/chart"
import Container from "./Container"
import React from "react"

export const description = "A pie chart with a label"


// Färger i global.css
const chartData = [
  { label: "Betald", invoices: 275, fill: "var(--color-payed)" },
  { label: "Ej betald", invoices: 10, fill: "var(--color-unpayed)" },
]

const chartConfig = {
  invoices: {
    label: "Fakturor",
  },
  payed: {
    label: "Betald",
    color: "var(--chart-2)",
  },
  unpayed: {
    label: "Ej betald",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export default function ChartPieLabel({
  columnSpan,
}: {
  columnSpan: number,
}) {

  const totalInvoices = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.invoices, 0)
  }, [])

  return (
    <Container columnSpan={columnSpan}>
      <h2 className="text-xl font-semibold text-slate-900 mb-4">Betalda fakturor förra månaden</h2>
      <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="invoices"
              nameKey="label"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalInvoices.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Fakturor
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
    </Container>
  )
}
